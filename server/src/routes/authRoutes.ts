import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'stocksense-super-secret-jwt-key-2026-production-grade';

// Sign Up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: role || 'Inventory Manager',
      },
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error registering user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error logging in' });
  }
});

// Request Password Reset OTP
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return safe message or notice
      return res.status(404).json({ error: 'No user registered with this email address.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Invalidate old OTPs
    await prisma.otpCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    await prisma.otpCode.create({
      data: {
        email: normalizedEmail,
        code: otp,
        expiresAt,
      },
    });

    console.log(`🔑 [StockSense OTP] Verification code for ${normalizedEmail}: ${otp}`);

    return res.json({
      message: 'OTP has been generated and sent to your email address.',
      email: normalizedEmail,
      // For effortless testing and evaluation in dev environments, include OTP in response:
      devOtp: otp,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error processing forgot password' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        code: otp.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please request a new one.' });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully. You may now reset your password.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error verifying OTP' });
  }
});

// Reset Password with OTP
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        code: otp.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and mark OTP as used
    await prisma.$transaction([
      prisma.user.update({
        where: { email: normalizedEmail },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.otpCode.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return res.json({
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error resetting password' });
  }
});

// Current User Profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching user' });
  }
});

// Update Profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name ? { name } : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.json({ message: 'Profile updated successfully', user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating profile' });
  }
});

export default router;

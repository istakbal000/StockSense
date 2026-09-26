import React, { useState } from 'react';
import { Boxes, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';



export const AuthView = () => {
  const { login } = useAuth();
  const [step, setStep] = useState('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Inventory Manager');

  // Password reset states
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devOtpNotification, setDevOtpNotification] = useState(null);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fillDemoManager = () => {
    setEmail('manager@stocksense.com');
    setPassword('password123');
    setError(null);
  };

  const fillDemoStaff = () => {
    setEmail('staff@stocksense.com');
    setPassword('password123');
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.signup({ name, email, password, role });
      login(res.token, res.user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(resetEmail);
      setDevOtpNotification(res.devOtp || null);
      setSuccessMessage(res.message || 'OTP code sent to your email.');
      setStep('verify-otp');
    } catch (err) {
      setError(err.message || 'Failed to request OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.verifyOtp(resetEmail, otp);
      setSuccessMessage('OTP code verified. Set your new password.');
      setStep('reset-password');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword({ email: resetEmail, otp, newPassword });
      setSuccessMessage('Password reset successfully! Please log in with your new password.');
      setEmail(resetEmail);
      setPassword('');
      setStep('login');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="w-full max-w-md">
        {/* Logo and Brand Title */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 items-center justify-center shadow-xl shadow-indigo-500/25 mb-3">
            <Boxes className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">StockSense</h1>
          <p className="text-xs text-slate-400 mt-1">Modular Inventory Management System</p>
        </div>

        {/* Card Container */}
        <div className="glass-dropdown rounded-3xl p-7 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          {/* Notifications */}
          {error &&
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          }

          {successMessage &&
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          }

          {devOtpNotification &&
          <div className="mb-4 p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-200">
              <span className="font-bold">🔑 OTP Development Preview:</span> Your verification code is{' '}
              <span className="font-mono font-extrabold text-white bg-indigo-600/40 px-2 py-0.5 rounded">
                {devOtpNotification}
              </span>
            </div>
          }

          {/* 1. LOGIN */}
          {step === 'login' &&
          <div>
              <div className="flex border-b border-slate-800 mb-6">
                <button
                type="button"
                className="flex-1 pb-3 text-sm font-semibold text-indigo-400 border-b-2 border-indigo-500">
                
                  Log In
                </button>
                <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setStep('signup');
                }}
                className="flex-1 pb-3 text-sm font-semibold text-slate-400 hover:text-slate-200">
                
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@stocksense.com"
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setResetEmail(email);
                      setStep('forgot');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
                    
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  
                  </div>
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
                
                  {loading ? 'Authenticating...' : 'Sign In to StockSense'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Credentials Autofill */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Quick Demo Access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                  type="button"
                  onClick={fillDemoManager}
                  className="p-2 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-indigo-500/50 text-left transition-all">
                  
                    <p className="text-xs font-bold text-white">Manager</p>
                    <p className="text-[10px] text-slate-400">Full operations</p>
                  </button>
                  <button
                  type="button"
                  onClick={fillDemoStaff}
                  className="p-2 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-indigo-500/50 text-left transition-all">
                  
                    <p className="text-xs font-bold text-white">Warehouse Staff</p>
                    <p className="text-[10px] text-slate-400">Transfers & counts</p>
                  </button>
                </div>
              </div>
            </div>
          }

          {/* 2. SIGN UP */}
          {step === 'signup' &&
          <div>
              <div className="flex border-b border-slate-800 mb-6">
                <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setStep('login');
                }}
                className="flex-1 pb-3 text-sm font-semibold text-slate-400 hover:text-slate-200">
                
                  Log In
                </button>
                <button
                type="button"
                className="flex-1 pb-3 text-sm font-semibold text-indigo-400 border-b-2 border-indigo-500">
                
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@stocksense.com"
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Warehouse Staff">Warehouse Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  
                  </div>
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50">
                
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          }

          {/* 3. FORGOT PASSWORD (OTP Request) */}
          {step === 'forgot' &&
          <div>
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Reset Password via OTP</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Enter your registered email address. We will generate a one-time verification code (OTP).
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="manager@stocksense.com"
                    className="w-full rounded-xl bg-slate-800/80 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                  
                    Back to Login
                  </button>
                  <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30">
                  
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            </div>
          }

          {/* 4. VERIFY OTP */}
          {step === 'verify-otp' &&
          <div>
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Verify OTP Code</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Enter the 6-digit verification code sent for <span className="text-white font-medium">{resetEmail}</span>.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Code</label>
                  <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-center tracking-widest font-mono text-xl py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                
                </div>

                <div className="flex gap-2">
                  <button
                  type="button"
                  onClick={() => setStep('forgot')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                  
                    Back
                  </button>
                  <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 disabled:opacity-50">
                  
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            </div>
          }

          {/* 5. RESET PASSWORD */}
          {step === 'reset-password' &&
          <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Set New Password</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Create a strong new password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                
                </div>

                <button
                type="submit"
                disabled={loading || newPassword.length < 6}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/30 disabled:opacity-50">
                
                  {loading ? 'Updating Password...' : 'Save New Password & Log In'}
                </button>
              </form>
            </div>
          }
        </div>
      </div>
    </div>);

};
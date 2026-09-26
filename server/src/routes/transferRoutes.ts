import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { InventoryService } from '../services/inventoryService';

const router = Router();

// List Transfers
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, locationId, search } = req.query;
    const where: any = {};

    if (status && status !== 'all') {
      where.status = String(status);
    }
    if (locationId) {
      where.OR = [
        { sourceLocationId: String(locationId) },
        { destinationLocationId: String(locationId) },
      ];
    }
    if (search) {
      where.transferNumber = { contains: String(search).trim() };
    }

    const transfers = await prisma.internalTransfer.findMany({
      where,
      include: {
        sourceLocation: { include: { warehouse: true } },
        destinationLocation: { include: { warehouse: true } },
        items: { include: { product: { include: { unitOfMeasure: true } } } },
        createdByUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ transfers });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching transfers' });
  }
});

// Get Transfer by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const transfer = await prisma.internalTransfer.findUnique({
      where: { id: req.params.id },
      include: {
        sourceLocation: { include: { warehouse: true } },
        destinationLocation: { include: { warehouse: true } },
        items: {
          include: {
            product: {
              include: {
                unitOfMeasure: true,
                balances: { include: { location: true } },
              },
            },
          },
        },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    if (!transfer) return res.status(404).json({ error: 'Internal transfer not found' });
    return res.json({ transfer });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching transfer' });
  }
});

// Create Internal Transfer
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sourceLocationId, destinationLocationId, items, notes, status } = req.body;

    if (!sourceLocationId || !destinationLocationId) {
      return res.status(400).json({ error: 'Source and destination locations are required' });
    }

    if (sourceLocationId === destinationLocationId) {
      return res.status(400).json({ error: 'Source location and destination location must be different' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required for internal transfer' });
    }

    const count = await prisma.internalTransfer.count();
    const transferNumber = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const transfer = await prisma.internalTransfer.create({
      data: {
        transferNumber,
        sourceLocationId,
        destinationLocationId,
        status: status || 'Ready',
        notes,
        createdByUserId: req.user?.id,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
          })),
        },
      },
      include: {
        sourceLocation: { include: { warehouse: true } },
        destinationLocation: { include: { warehouse: true } },
        items: { include: { product: true } },
      },
    });

    return res.status(201).json({ transfer });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error creating transfer' });
  }
});

// Validate Transfer
router.post('/:id/validate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await InventoryService.validateTransfer(req.params.id, req.user?.id);
    return res.json({
      message: 'Internal transfer completed successfully. Source and destination stock updated; total stock unchanged.',
      transfer: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Error validating transfer' });
  }
});

// Cancel Transfer
router.post('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const transfer = await prisma.internalTransfer.findUnique({ where: { id: req.params.id } });
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
    if (transfer.status === 'Done') {
      return res.status(400).json({ error: 'Cannot cancel a completed internal transfer.' });
    }

    const updated = await prisma.internalTransfer.update({
      where: { id: req.params.id },
      data: { status: 'Canceled' },
    });

    return res.json({ message: 'Internal transfer canceled', transfer: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error canceling transfer' });
  }
});

export default router;

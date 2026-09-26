import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

import { InventoryService } from '../services/inventoryService.js';

const router = Router();

// List Receipts
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, destinationLocationId, search } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = String(status);
    }
    if (destinationLocationId) {
      where.destinationLocationId = String(destinationLocationId);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
      { receiptNumber: { contains: q } },
      { supplierName: { contains: q } }];

    }

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        destinationLocation: { include: { warehouse: true } },
        items: { include: { product: { include: { unitOfMeasure: true } } } },
        createdByUser: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ receipts });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error fetching receipts' });
  }
});

// Get Receipt by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: req.params.id },
      include: {
        destinationLocation: { include: { warehouse: true } },
        items: {
          include: {
            product: {
              include: { unitOfMeasure: true }
            }
          }
        },
        createdByUser: { select: { id: true, name: true } }
      }
    });

    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    return res.json({ receipt });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error fetching receipt' });
  }
});

// Create Receipt
router.post('/', authenticate, async (req, res) => {
  try {
    const { supplierName, destinationLocationId, items, notes, status } = req.body;

    if (!supplierName || !destinationLocationId) {
      return res.status(400).json({ error: 'Supplier name and destination location are required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required in the receipt' });
    }

    // Auto-generate receipt number
    const count = await prisma.receipt.count();
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        supplierName: supplierName.trim(),
        destinationLocationId,
        status: status || 'Ready',
        notes,
        createdByUserId: req.user?.id,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            notes: i.notes || ''
          }))
        }
      },
      include: {
        destinationLocation: { include: { warehouse: true } },
        items: { include: { product: true } }
      }
    });

    return res.status(201).json({ receipt });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error creating receipt' });
  }
});

// Validate Receipt -> triggers automatic stock increase & ledger creation
router.post('/:id/validate', authenticate, async (req, res) => {
  try {
    const updated = await InventoryService.validateReceipt(req.params.id, req.user?.id);
    return res.json({
      message: 'Receipt validated successfully. Stock levels increased and logged to ledger.',
      receipt: updated
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Error validating receipt' });
  }
});

// Cancel Receipt
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const receipt = await prisma.receipt.findUnique({ where: { id: req.params.id } });
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    if (receipt.status === 'Done') {
      return res.status(400).json({ error: 'Cannot cancel a completed receipt that has already updated stock.' });
    }

    const updated = await prisma.receipt.update({
      where: { id: req.params.id },
      data: { status: 'Canceled' }
    });

    return res.json({ message: 'Receipt canceled', receipt: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error canceling receipt' });
  }
});

export default router;
import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

import { InventoryService } from '../services/inventoryService.js';

const router = Router();

// List Adjustments
router.get('/', authenticate, async (req, res) => {
  try {
    const { productId, locationId, search } = req.query;
    const where = {};

    if (productId) where.productId = String(productId);
    if (locationId) where.locationId = String(locationId);
    if (search) {
      where.adjustmentNumber = { contains: String(search).trim() };
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
      where,
      include: {
        product: { include: { unitOfMeasure: true } },
        location: { include: { warehouse: true } },
        createdByUser: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ adjustments });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching adjustments' });
  }
});

// Calculate current recorded stock for an adjustment preview
router.get('/preview', authenticate, async (req, res) => {
  try {
    const { productId, locationId } = req.query;
    if (!productId || !locationId) {
      return res.status(400).json({ error: 'Product ID and Location ID are required' });
    }

    const balance = await InventoryService.getBalance(String(productId), String(locationId));
    return res.json({ recordedQuantity: balance });
  } catch (err) {
    return res.status(500).json({ error: 'Error previewing stock' });
  }
});

// Create and apply Adjustment
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, locationId, physicalCount, reason, batchId } = req.body;

    if (!productId || !locationId || physicalCount === undefined) {
      return res.status(400).json({ error: 'Product, Location, and Physical Count are required' });
    }

    const count = Number(physicalCount);
    if (isNaN(count) || count < 0) {
      return res.status(400).json({ error: 'Physical count must be a non-negative number' });
    }

    const adjustment = await InventoryService.applyAdjustment(
      productId,
      locationId,
      count,
      reason,
      req.user?.id
    );

    return res.status(201).json({
      message: 'Inventory adjustment applied and recorded in Stock Ledger.',
      adjustment
    });
  } catch (err) {
    return res.status(400).json({ error: 'Error creating adjustment' });
  }
});

export default router;
import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

import { InventoryService } from '../services/inventoryService.js';

const router = Router();

// List Deliveries
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, sourceLocationId, search } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = String(status);
    }
    if (sourceLocationId) {
      where.sourceLocationId = String(sourceLocationId);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } }];

    }

    const deliveries = await prisma.deliveryOrder.findMany({
      where,
      include: {
        sourceLocation: { include: { warehouse: true } },
        items: { include: { product: { include: { unitOfMeasure: true } } } },
        createdByUser: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ deliveries });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error fetching delivery orders' });
  }
});

// Get Delivery by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: {
        sourceLocation: { include: { warehouse: true } },
        items: {
          include: {
            product: {
              include: {
                unitOfMeasure: true,
                balances: {
                  include: { location: true }
                }
              }
            }
          }
        },
        createdByUser: { select: { id: true, name: true } }
      }
    });

    if (!delivery) return res.status(404).json({ error: 'Delivery order not found' });
    return res.json({ delivery });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error fetching delivery order' });
  }
});

// Create Delivery Order
router.post('/', authenticate, async (req, res) => {
  try {
    const { customerName, sourceLocationId, items, notes, status } = req.body;

    if (!customerName || !sourceLocationId) {
      return res.status(400).json({ error: 'Customer / shipment name and source location are required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product item is required' });
    }

    const count = await prisma.deliveryOrder.count();
    const orderNumber = `DEL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const delivery = await prisma.deliveryOrder.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        sourceLocationId,
        status: status || 'Ready',
        pickStatus: 'Pending',
        packStatus: 'Pending',
        notes,
        createdByUserId: req.user?.id,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            pickedQuantity: 0,
            packedQuantity: 0
          }))
        }
      },
      include: {
        sourceLocation: { include: { warehouse: true } },
        items: { include: { product: true } }
      }
    });

    return res.status(201).json({ delivery });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error creating delivery order' });
  }
});

// Pick Items workflow action
router.post('/:id/pick', authenticate, async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!delivery) return res.status(404).json({ error: 'Delivery order not found' });
    if (delivery.status === 'Done' || delivery.status === 'Canceled') {
      return res.status(400).json({ error: `Cannot update picking on a ${delivery.status.toLowerCase()} delivery.` });
    }

    // Update item picked quantities to full quantity
    await prisma.$transaction([
    ...delivery.items.map((item) =>
    prisma.deliveryItem.update({
      where: { id: item.id },
      data: { pickedQuantity: item.quantity }
    })
    ),
    prisma.deliveryOrder.update({
      where: { id: delivery.id },
      data: { pickStatus: 'Picked' }
    })]
    );

    const updated = await prisma.deliveryOrder.findUnique({
      where: { id: delivery.id },
      include: { items: { include: { product: true } }, sourceLocation: true }
    });

    return res.json({ message: 'All items marked as Picked', delivery: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error updating picking status' });
  }
});

// Pack Items workflow action
router.post('/:id/pack', authenticate, async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!delivery) return res.status(404).json({ error: 'Delivery order not found' });
    if (delivery.status === 'Done' || delivery.status === 'Canceled') {
      return res.status(400).json({ error: `Cannot update packing on a ${delivery.status.toLowerCase()} delivery.` });
    }

    // Auto-pick if not picked, then pack
    await prisma.$transaction([
    ...delivery.items.map((item) =>
    prisma.deliveryItem.update({
      where: { id: item.id },
      data: {
        pickedQuantity: item.quantity,
        packedQuantity: item.quantity
      }
    })
    ),
    prisma.deliveryOrder.update({
      where: { id: delivery.id },
      data: {
        pickStatus: 'Picked',
        packStatus: 'Packed'
      }
    })]
    );

    const updated = await prisma.deliveryOrder.findUnique({
      where: { id: delivery.id },
      include: { items: { include: { product: true } }, sourceLocation: true }
    });

    return res.json({ message: 'All items marked as Packed', delivery: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error updating packing status' });
  }
});

// Validate Delivery Order -> verifies stock, decreases stock from source, creates ledger entry
router.post('/:id/validate', authenticate, async (req, res) => {
  try {
    const updated = await InventoryService.validateDelivery(req.params.id, req.user?.id);
    return res.json({
      message: 'Delivery order validated successfully. Stock levels decreased and logged to ledger.',
      delivery: updated
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Error validating delivery order' });
  }
});

// Cancel Delivery Order
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({ where: { id: req.params.id } });
    if (!delivery) return res.status(404).json({ error: 'Delivery order not found' });
    if (delivery.status === 'Done') {
      return res.status(400).json({ error: 'Cannot cancel a completed delivery that has already updated stock.' });
    }

    const updated = await prisma.deliveryOrder.update({
      where: { id: req.params.id },
      data: { status: 'Canceled' }
    });

    return res.json({ message: 'Delivery order canceled', delivery: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error canceling delivery order' });
  }
});

export default router;
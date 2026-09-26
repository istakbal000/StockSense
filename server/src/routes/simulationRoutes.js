import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Create Scenario
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Scenario name is required' });

    const scenario = await prisma.simulationScenario.create({
      data: {
        name,
        description,
        createdByUserId: req.user.id
      }
    });
    return res.status(201).json({ scenario });
  } catch (err) {
    return res.status(500).json({ error: 'Error creating scenario' });
  }
});

// Add Event
router.post('/:id/events', authenticate, async (req, res) => {
  try {
    const { eventType, productId, expectedDate, quantity, sourceLocationId, destinationLocationId } = req.body;
    
    if (!['RECEIPT', 'DELIVERY', 'TRANSFER'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid eventType' });
    }
    
    const event = await prisma.simulationEvent.create({
      data: {
        scenarioId: req.params.id,
        eventType,
        productId,
        expectedDate: new Date(expectedDate),
        quantity: Number(quantity),
        sourceLocationId: sourceLocationId || null,
        destinationLocationId: destinationLocationId || null
      }
    });
    return res.status(201).json({ event });
  } catch (err) {
    return res.status(500).json({ error: 'Error adding event' });
  }
});

// Run Simulation (In-Memory Projection)
router.get('/:id/run', authenticate, async (req, res) => {
  try {
    const scenario = await prisma.simulationScenario.findUnique({
      where: { id: req.params.id },
      include: {
        events: {
          orderBy: { expectedDate: 'asc' },
          include: {
            product: { select: { id: true, name: true, sku: true } },
            sourceLocation: { select: { id: true, name: true } },
            destinationLocation: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    // Find all product IDs involved
    const productIds = [...new Set(scenario.events.map(e => e.productId))];

    // Load actual current balances
    const actualBalances = await prisma.inventoryBalance.findMany({
      where: { productId: { in: productIds } },
      include: { location: { select: { id: true, name: true } } }
    });

    // Build initial in-memory map: map[productId][locationId] = quantity
    const memoryStock = {};
    for (const b of actualBalances) {
      if (!memoryStock[b.productId]) memoryStock[b.productId] = {};
      if (!memoryStock[b.productId][b.locationId]) memoryStock[b.productId][b.locationId] = 0;
      memoryStock[b.productId][b.locationId] += b.quantity;
    }

    const timeline = [];

    // Process events chronologically
    for (const event of scenario.events) {
      const pId = event.productId;
      const srcId = event.sourceLocationId;
      const destId = event.destinationLocationId;
      const qty = event.quantity;
      let hasNegativeStock = false;
      let conflictMessage = null;

      if (!memoryStock[pId]) memoryStock[pId] = {};

      if (event.eventType === 'DELIVERY' && srcId) {
        memoryStock[pId][srcId] = (memoryStock[pId][srcId] || 0) - qty;
        if (memoryStock[pId][srcId] < 0) {
          hasNegativeStock = true;
          conflictMessage = `Insufficient stock at ${event.sourceLocation.name}`;
        }
      } else if (event.eventType === 'RECEIPT' && destId) {
        memoryStock[pId][destId] = (memoryStock[pId][destId] || 0) + qty;
      } else if (event.eventType === 'TRANSFER' && srcId && destId) {
        memoryStock[pId][srcId] = (memoryStock[pId][srcId] || 0) - qty;
        if (memoryStock[pId][srcId] < 0) {
          hasNegativeStock = true;
          conflictMessage = `Insufficient stock at ${event.sourceLocation.name} for transfer`;
        }
        memoryStock[pId][destId] = (memoryStock[pId][destId] || 0) + qty;
      }

      // Snapshot the relevant balances for this event step
      const stepBalances = {};
      if (srcId) stepBalances[srcId] = memoryStock[pId][srcId];
      if (destId) stepBalances[destId] = memoryStock[pId][destId];

      timeline.push({
        event: {
          id: event.id,
          type: event.eventType,
          date: event.expectedDate,
          product: event.product,
          qty,
          src: event.sourceLocation?.name,
          dest: event.destinationLocation?.name
        },
        projectedBalances: stepBalances,
        hasConflict: hasNegativeStock,
        conflictMessage
      });
    }

    return res.json({ scenario: scenario.name, timeline });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error running simulation' });
  }
});

// List Scenarios
router.get('/', authenticate, async (req, res) => {
  try {
    const scenarios = await prisma.simulationScenario.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { events: true } } }
    });
    return res.json({ scenarios });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching scenarios' });
  }
});

export default router;

import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all warehouses with locations
router.get('/', authenticate, async (_req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            balances: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ warehouses });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error fetching warehouses' });
  }
});

// Create Warehouse
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Warehouse name and code are required' });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code: code.toUpperCase().trim(),
        address
      }
    });
    return res.status(201).json({ warehouse });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error creating warehouse' });
  }
});

// Get all locations flat list
router.get('/locations', authenticate, async (req, res) => {
  try {
    const { warehouseId } = req.query;
    const locations = await prisma.location.findMany({
      where: warehouseId ? { warehouseId: String(warehouseId) } : undefined,
      include: {
        warehouse: true,
        balances: {
          include: { product: true }
        }
      },
      orderBy: [{ warehouse: { name: 'asc' } }, { name: 'asc' }]
    });
    return res.json({ locations });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error fetching locations' });
  }
});

// Create Location
router.post('/locations', authenticate, async (req, res) => {
  try {
    const { warehouseId, name, code, type } = req.body;
    if (!warehouseId || !name || !code) {
      return res.status(400).json({ error: 'Warehouse, location name, and location code are required' });
    }

    const location = await prisma.location.create({
      data: {
        warehouseId,
        name,
        code: code.toUpperCase().trim(),
        type: type || 'Rack'
      },
      include: { warehouse: true }
    });
    return res.status(201).json({ location });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error creating location' });
  }
});

export default router;
import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// List Anomalies
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const anomalies = await prisma.inventoryAnomaly.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        location: { select: { id: true, name: true, code: true } },
        resolvedByUser: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ anomalies });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error fetching anomalies' });
  }
});

// Resolve Anomaly
router.put('/:id/resolve', authenticate, async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    if (!resolutionNotes || resolutionNotes.trim().length === 0) {
      return res.status(400).json({ error: 'Resolution notes are required to resolve an anomaly' });
    }

    const anomaly = await prisma.inventoryAnomaly.update({
      where: { id: req.params.id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes.trim(),
        resolvedByUserId: req.user.id
      },
      include: {
        product: true,
        location: true,
        resolvedByUser: true
      }
    });

    return res.json({ anomaly });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error resolving anomaly' });
  }
});

export default router;

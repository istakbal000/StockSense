import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get Move History / Stock Ledger
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { movementType, productId, locationId, search } = req.query;
    const where: any = {};

    if (movementType && movementType !== 'all') {
      where.movementType = String(movementType).toUpperCase();
    }

    if (productId) {
      where.productId = String(productId);
    }

    if (locationId) {
      where.OR = [
        { fromLocationId: String(locationId) },
        { toLocationId: String(locationId) },
      ];
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { referenceDocument: { contains: q } },
        { notes: { contains: q } },
        { product: { name: { contains: q } } },
        { product: { sku: { contains: q } } },
      ];
    }

    const ledgerEntries = await prisma.stockLedgerEntry.findMany({
      where,
      include: {
        product: {
          include: { unitOfMeasure: true, category: true },
        },
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return res.json({ ledgerEntries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching move history' });
  }
});

export default router;

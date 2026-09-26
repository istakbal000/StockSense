import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// List categories
router.get('/categories', authenticate, async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json({ categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching categories' });
  }
});

// Create category
router.post('/categories', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const category = await prisma.category.create({
      data: { name: name.trim(), description },
    });
    return res.status(201).json({ category });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error creating category' });
  }
});

// List units of measure
router.get('/units', authenticate, async (_req: Request, res: Response) => {
  try {
    const units = await prisma.unitOfMeasure.findMany({ orderBy: { name: 'asc' } });
    return res.json({ units });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching units' });
  }
});

// Create unit of measure
router.post('/units', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, symbol } = req.body;
    if (!name || !symbol) return res.status(400).json({ error: 'Unit name and symbol are required' });

    const unit = await prisma.unitOfMeasure.create({
      data: { name: name.trim(), symbol: symbol.trim() },
    });
    return res.status(201).json({ unit });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error creating unit' });
  }
});

// List products (with optional search, category, location filter)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { search, categoryId, locationId, status } = req.query;

    const whereClause: any = {};

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = String(categoryId);
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        unitOfMeasure: true,
        balances: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
        reorderingRules: {
          include: { location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute totals and stock condition for each product
    const enrichedProducts = products.map((p) => {
      const totalStock = p.balances.reduce((acc, b) => acc + b.quantity, 0);
      const minRule = p.reorderingRules.length > 0 ? p.reorderingRules[0].minQuantity : 10;
      
      let stockStatus = 'In Stock';
      if (totalStock === 0) {
        stockStatus = 'Out of Stock';
      } else if (totalStock <= minRule) {
        stockStatus = 'Low Stock';
      }

      return {
        ...p,
        totalStock,
        reorderMin: minRule,
        stockStatus,
      };
    });

    return res.json({ products: enrichedProducts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching products' });
  }
});

// Get single product with detailed location breakdown
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        unitOfMeasure: true,
        balances: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
        reorderingRules: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
        ledgerEntries: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            fromLocation: true,
            toLocation: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalStock = product.balances.reduce((acc, b) => acc + b.quantity, 0);

    return res.json({ product: { ...product, totalStock } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching product' });
  }
});

// Create product (with optional initial stock and initial location)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, categoryId, unitOfMeasureId, initialStock, initialLocationId } = req.body;

    if (!name || !sku || !categoryId || !unitOfMeasureId) {
      return res.status(400).json({
        error: 'Product Name, SKU / Code, Category, and Unit of Measure are required.',
      });
    }

    const cleanSku = sku.trim().toUpperCase();
    const existingSku = await prisma.product.findUnique({ where: { sku: cleanSku } });
    if (existingSku) {
      return res.status(400).json({ error: `Product with SKU "${cleanSku}" already exists.` });
    }

    const parsedStock = initialStock !== undefined && initialStock !== '' ? Number(initialStock) : 0;
    if (parsedStock < 0) {
      return res.status(400).json({ error: 'Initial stock cannot be negative.' });
    }

    if (parsedStock > 0 && !initialLocationId) {
      return res.status(400).json({
        error: 'Initial location is required when initializing stock for a new product.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          sku: cleanSku,
          categoryId,
          unitOfMeasureId,
          initialStock: parsedStock,
        },
        include: { category: true, unitOfMeasure: true },
      });

      // Default reordering rule
      await tx.reorderingRule.create({
        data: {
          productId: product.id,
          minQuantity: 10,
          targetQuantity: 50,
        },
      });

      // If initial stock provided, initialize balance & write INITIAL_STOCK ledger
      if (parsedStock > 0 && initialLocationId) {
        await tx.inventoryBalance.create({
          data: {
            productId: product.id,
            locationId: initialLocationId,
            quantity: parsedStock,
          },
        });

        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'INITIAL_STOCK',
            referenceDocument: `INIT-${cleanSku}`,
            productId: product.id,
            quantity: parsedStock,
            toLocationId: initialLocationId,
            notes: `Initial stock allocated on product creation`,
            userId: req.user?.id,
          },
        });
      }

      return product;
    });

    return res.status(201).json({ product: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error creating product' });
  }
});

// Update product
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, sku, categoryId, unitOfMeasureId } = req.body;
    const { id } = req.params;

    const cleanSku = sku ? sku.trim().toUpperCase() : undefined;
    if (cleanSku) {
      const existing = await prisma.product.findFirst({
        where: { sku: cleanSku, NOT: { id } },
      });
      if (existing) {
        return res.status(400).json({ error: `SKU "${cleanSku}" is already taken by another product.` });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(cleanSku ? { sku: cleanSku } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(unitOfMeasureId ? { unitOfMeasureId } : {}),
      },
      include: { category: true, unitOfMeasure: true },
    });

    return res.json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating product' });
  }
});

// Reordering Rules for product
router.post('/:id/reordering-rules', authenticate, async (req: Request, res: Response) => {
  try {
    const { minQuantity, targetQuantity, locationId } = req.body;
    const productId = req.params.id;

    if (minQuantity === undefined || Number(minQuantity) < 0) {
      return res.status(400).json({ error: 'Valid minimum quantity is required' });
    }

    const rule = await prisma.reorderingRule.upsert({
      where: {
        productId_locationId: {
          productId,
          locationId: locationId || null,
        },
      },
      update: {
        minQuantity: Number(minQuantity),
        targetQuantity: targetQuantity ? Number(targetQuantity) : null,
      },
      create: {
        productId,
        locationId: locationId || null,
        minQuantity: Number(minQuantity),
        targetQuantity: targetQuantity ? Number(targetQuantity) : null,
      },
    });

    return res.json({ rule });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error updating reordering rule' });
  }
});

export default router;

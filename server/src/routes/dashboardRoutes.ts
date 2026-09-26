import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// Dashboard Summary & KPIs
router.get('/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    // 1. Products and inventory balances
    const products = await prisma.product.findMany({
      include: {
        balances: true,
        reorderingRules: true,
        category: true,
        unitOfMeasure: true,
      },
    });

    let totalStockUnits = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems: any[] = [];
    const outOfStockItems: any[] = [];

    for (const p of products) {
      const currentStock = p.balances.reduce((sum, b) => sum + b.quantity, 0);
      totalStockUnits += currentStock;

      const minRule = p.reorderingRules.length > 0 ? p.reorderingRules[0].minQuantity : 10;
      const targetRule = p.reorderingRules.length > 0 ? p.reorderingRules[0].targetQuantity : 50;

      if (currentStock === 0) {
        outOfStockCount++;
        outOfStockItems.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category.name,
          unit: p.unitOfMeasure.symbol,
          currentStock: 0,
          minQuantity: minRule,
          targetQuantity: targetRule,
        });
      } else if (currentStock <= minRule) {
        lowStockCount++;
        lowStockItems.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category.name,
          unit: p.unitOfMeasure.symbol,
          currentStock,
          minQuantity: minRule,
          targetQuantity: targetRule,
        });
      } else {
        inStockCount++;
      }
    }

    // 2. Pending Receipts (Draft, Waiting, Ready)
    const pendingReceipts = await prisma.receipt.count({
      where: {
        status: { in: ['Draft', 'Waiting', 'Ready'] },
      },
    });

    // 3. Pending Deliveries (Draft, Waiting, Ready)
    const pendingDeliveries = await prisma.deliveryOrder.count({
      where: {
        status: { in: ['Draft', 'Waiting', 'Ready'] },
      },
    });

    // 4. Internal Transfers Scheduled (Draft, Waiting, Ready)
    const internalTransfersScheduled = await prisma.internalTransfer.count({
      where: {
        status: { in: ['Draft', 'Waiting', 'Ready'] },
      },
    });

    // 5. Total Products Count
    const totalProductsCount = products.length;

    return res.json({
      kpis: {
        totalProductsInStock: totalStockUnits,
        totalProductsCount,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        totalAlertsCount: lowStockCount + outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        internalTransfersScheduled,
      },
      alerts: {
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching dashboard KPIs' });
  }
});

// Dynamic Operations Stream (Filtered by Document Type, Status, Warehouse/Location, Category)
router.get('/operations', authenticate, async (req: Request, res: Response) => {
  try {
    const { docType, status, warehouseId, locationId, categoryId, search } = req.query;

    const results: any[] = [];

    // Helper filter check
    const matchesStatus = (s: string) => !status || status === 'all' || s.toLowerCase() === String(status).toLowerCase();
    const matchesSearch = (text: string) => !search || text.toLowerCase().includes(String(search).toLowerCase());

    // 1. Receipts (Document Type: Receipts)
    if (!docType || docType === 'all' || docType === 'Receipts') {
      const receipts = await prisma.receipt.findMany({
        where: {
          ...(status && status !== 'all' ? { status: String(status) } : {}),
          ...(locationId ? { destinationLocationId: String(locationId) } : {}),
          ...(warehouseId ? { destinationLocation: { warehouseId: String(warehouseId) } } : {}),
        },
        include: {
          destinationLocation: { include: { warehouse: true } },
          items: {
            include: {
              product: { include: { category: true, unitOfMeasure: true } },
            },
          },
          createdByUser: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      for (const r of receipts) {
        // filter by category if specified
        if (categoryId) {
          const hasCategory = r.items.some((i) => i.product.categoryId === categoryId);
          if (!hasCategory) continue;
        }

        const summaryText = `${r.receiptNumber} ${r.supplierName} ${r.destinationLocation.name} ${r.items.map(i => i.product.name + ' ' + i.product.sku).join(' ')}`;
        if (!matchesSearch(summaryText)) continue;

        results.push({
          id: r.id,
          docType: 'Receipts',
          docNumber: r.receiptNumber,
          partner: r.supplierName,
          status: r.status,
          date: r.createdAt,
          locationName: r.destinationLocation.name,
          warehouseName: r.destinationLocation.warehouse.name,
          itemsCount: r.items.length,
          totalQuantity: r.items.reduce((sum, i) => sum + i.quantity, 0),
          items: r.items.map(i => ({
            name: i.product.name,
            sku: i.product.sku,
            quantity: i.quantity,
            unit: i.product.unitOfMeasure.symbol,
          })),
        });
      }
    }

    // 2. Deliveries (Document Type: Delivery)
    if (!docType || docType === 'all' || docType === 'Delivery') {
      const deliveries = await prisma.deliveryOrder.findMany({
        where: {
          ...(status && status !== 'all' ? { status: String(status) } : {}),
          ...(locationId ? { sourceLocationId: String(locationId) } : {}),
          ...(warehouseId ? { sourceLocation: { warehouseId: String(warehouseId) } } : {}),
        },
        include: {
          sourceLocation: { include: { warehouse: true } },
          items: {
            include: {
              product: { include: { category: true, unitOfMeasure: true } },
            },
          },
          createdByUser: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      for (const d of deliveries) {
        if (categoryId) {
          const hasCategory = d.items.some((i) => i.product.categoryId === categoryId);
          if (!hasCategory) continue;
        }

        const summaryText = `${d.orderNumber} ${d.customerName} ${d.sourceLocation.name} ${d.items.map(i => i.product.name + ' ' + i.product.sku).join(' ')}`;
        if (!matchesSearch(summaryText)) continue;

        results.push({
          id: d.id,
          docType: 'Delivery',
          docNumber: d.orderNumber,
          partner: d.customerName,
          status: d.status,
          pickStatus: d.pickStatus,
          packStatus: d.packStatus,
          date: d.createdAt,
          locationName: d.sourceLocation.name,
          warehouseName: d.sourceLocation.warehouse.name,
          itemsCount: d.items.length,
          totalQuantity: d.items.reduce((sum, i) => sum + i.quantity, 0),
          items: d.items.map(i => ({
            name: i.product.name,
            sku: i.product.sku,
            quantity: i.quantity,
            unit: i.product.unitOfMeasure.symbol,
          })),
        });
      }
    }

    // 3. Transfers (Document Type: Internal)
    if (!docType || docType === 'all' || docType === 'Internal') {
      const transfers = await prisma.internalTransfer.findMany({
        where: {
          ...(status && status !== 'all' ? { status: String(status) } : {}),
          ...(locationId
            ? { OR: [{ sourceLocationId: String(locationId) }, { destinationLocationId: String(locationId) }] }
            : {}),
          ...(warehouseId
            ? {
                OR: [
                  { sourceLocation: { warehouseId: String(warehouseId) } },
                  { destinationLocation: { warehouseId: String(warehouseId) } },
                ],
              }
            : {}),
        },
        include: {
          sourceLocation: { include: { warehouse: true } },
          destinationLocation: { include: { warehouse: true } },
          items: {
            include: {
              product: { include: { category: true, unitOfMeasure: true } },
            },
          },
          createdByUser: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      for (const t of transfers) {
        if (categoryId) {
          const hasCategory = t.items.some((i) => i.product.categoryId === categoryId);
          if (!hasCategory) continue;
        }

        const summaryText = `${t.transferNumber} ${t.sourceLocation.name} ${t.destinationLocation.name} ${t.items.map(i => i.product.name + ' ' + i.product.sku).join(' ')}`;
        if (!matchesSearch(summaryText)) continue;

        results.push({
          id: t.id,
          docType: 'Internal',
          docNumber: t.transferNumber,
          partner: `${t.sourceLocation.name} → ${t.destinationLocation.name}`,
          status: t.status,
          date: t.createdAt,
          locationName: `${t.sourceLocation.name} → ${t.destinationLocation.name}`,
          warehouseName: `${t.sourceLocation.warehouse.name} / ${t.destinationLocation.warehouse.name}`,
          itemsCount: t.items.length,
          totalQuantity: t.items.reduce((sum, i) => sum + i.quantity, 0),
          items: t.items.map(i => ({
            name: i.product.name,
            sku: i.product.sku,
            quantity: i.quantity,
            unit: i.product.unitOfMeasure.symbol,
          })),
        });
      }
    }

    // 4. Adjustments (Document Type: Adjustments)
    if (!docType || docType === 'all' || docType === 'Adjustments') {
      const adjustments = await prisma.inventoryAdjustment.findMany({
        where: {
          ...(status && status !== 'all' ? { status: String(status) } : {}),
          ...(locationId ? { locationId: String(locationId) } : {}),
          ...(warehouseId ? { location: { warehouseId: String(warehouseId) } } : {}),
          ...(categoryId ? { product: { categoryId: String(categoryId) } } : {}),
        },
        include: {
          product: { include: { category: true, unitOfMeasure: true } },
          location: { include: { warehouse: true } },
          createdByUser: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      for (const a of adjustments) {
        const summaryText = `${a.adjustmentNumber} ${a.product.name} ${a.product.sku} ${a.location.name} ${a.reason || ''}`;
        if (!matchesSearch(summaryText)) continue;

        results.push({
          id: a.id,
          docType: 'Adjustments',
          docNumber: a.adjustmentNumber,
          partner: `Physical Count: ${a.physicalCount} (Diff: ${a.difference > 0 ? '+' : ''}${a.difference})`,
          status: a.status,
          date: a.createdAt,
          locationName: a.location.name,
          warehouseName: a.location.warehouse.name,
          itemsCount: 1,
          totalQuantity: a.physicalCount,
          items: [
            {
              name: a.product.name,
              sku: a.product.sku,
              quantity: a.physicalCount,
              unit: a.product.unitOfMeasure.symbol,
              difference: a.difference,
            },
          ],
        });
      }
    }

    // Sort combined results by date descending
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({ operations: results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching dashboard operations' });
  }
});

export default router;

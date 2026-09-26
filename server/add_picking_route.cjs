const fs = require('fs');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/deliveryRoutes.js';
let c = fs.readFileSync(p, 'utf8');

const routeCode = `
// Generate Optimized Picking Route
router.get('/:id/picking-route', authenticate, async (req, res) => {
  try {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id: req.params.id },
      include: {
        sourceLocation: { include: { warehouse: true } },
        items: { include: { product: true } }
      }
    });

    if (!delivery) return res.status(404).json({ error: 'Delivery order not found' });

    const warehouseId = delivery.sourceLocation.warehouseId;
    const pickingSteps = [];

    for (const item of delivery.items) {
      if (item.quantity <= 0) continue;

      let remainingToPick = item.quantity;
      
      const orderBy = [];
      if (item.product.isExpiryTracked) {
        orderBy.push({ batch: { expiryDate: 'asc' } });
      }
      orderBy.push({ location: { code: 'asc' } });

      const balances = await prisma.inventoryBalance.findMany({
        where: {
          productId: item.productId,
          quantity: { gt: 0 },
          location: { warehouseId }
        },
        orderBy,
        include: {
          location: true,
          batch: true,
          product: true
        }
      });

      for (const balance of balances) {
        if (remainingToPick <= 0) break;

        const pickQty = Math.min(remainingToPick, balance.quantity);
        pickingSteps.push({
          locationCode: balance.location.code,
          locationName: balance.location.name,
          productSku: balance.product.sku,
          productName: balance.product.name,
          batchNumber: balance.batch ? balance.batch.batchNumber : null,
          quantityToPick: pickQty
        });

        remainingToPick -= pickQty;
      }

      if (remainingToPick > 0) {
        pickingSteps.push({
          locationCode: 'MISSING',
          locationName: 'Out of Stock',
          productSku: item.product.sku,
          productName: item.product.name,
          batchNumber: null,
          quantityToPick: remainingToPick,
          isShortfall: true
        });
      }
    }

    // Sort final list alphanumerically by location code to optimize walking route
    pickingSteps.sort((a, b) => {
      if (a.isShortfall) return 1;
      if (b.isShortfall) return -1;
      return a.locationCode.localeCompare(b.locationCode, undefined, { numeric: true, sensitivity: 'base' });
    });

    return res.json({ pickingRoute: pickingSteps });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error generating picking route' });
  }
});
`;

c = c.replace(/export default router;/g, routeCode + '\nexport default router;');

fs.writeFileSync(p, c);
console.log('Picking route API added');

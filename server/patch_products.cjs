const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/productRoutes.js';
let c = fs.readFileSync(p, 'utf8');

// 1. GET /:id include batches
c = c.replace(/reorderingRules: \{\s*include: \{\s*location: \{\s*include: \{ warehouse: true \}\s*\}\s*\}\s*\},/g, 
  "reorderingRules: { include: { location: { include: { warehouse: true } } } },\n        batches: { orderBy: { expiryDate: 'asc' } },");

// 2. POST / (Create)
c = c.replace(/const \{ name, sku, categoryId, unitOfMeasureId, initialStock, initialLocationId \} = req.body;/g, 
  "const { name, sku, categoryId, unitOfMeasureId, initialStock, initialLocationId, isBatchTracked, isExpiryTracked } = req.body;");

c = c.replace(/initialStock: parsedStock\n\s*\},/g, 
  "initialStock: parsedStock,\n          isBatchTracked: !!isBatchTracked,\n          isExpiryTracked: !!isExpiryTracked\n        },");

c = c.replace(/if \(parsedStock > 0 && initialLocationId\) \{/g, 
  `if (parsedStock > 0 && initialLocationId) {
        let batchId = null;
        if (!!isBatchTracked) {
          const batch = await tx.productBatch.create({
            data: {
              productId: product.id,
              batchNumber: \`INIT-\${cleanSku}\`,
              expiryDate: !!isExpiryTracked ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : null
            }
          });
          batchId = batch.id;
        }`);

c = c.replace(/productId: product.id,\n\s*locationId: initialLocationId,\n\s*quantity: parsedStock/g, 
  "productId: product.id,\n            locationId: initialLocationId,\n            batchId: batchId,\n            quantity: parsedStock");

c = c.replace(/productId: product.id,\n\s*quantity: parsedStock,\n\s*toLocationId: initialLocationId/g, 
  "productId: product.id,\n            batchId: batchId,\n            quantity: parsedStock,\n            toLocationId: initialLocationId");

// 3. PUT /:id (Update)
c = c.replace(/const \{ name, sku, categoryId, unitOfMeasureId \} = req.body;/g, 
  "const { name, sku, categoryId, unitOfMeasureId, isBatchTracked, isExpiryTracked } = req.body;");

c = c.replace(/\.\.\.\(unitOfMeasureId \? \{ unitOfMeasureId \} : \{\}\)\n\s*\}/g, 
  "...(unitOfMeasureId ? { unitOfMeasureId } : {}),\n        ...(isBatchTracked !== undefined ? { isBatchTracked: !!isBatchTracked } : {}),\n        ...(isExpiryTracked !== undefined ? { isExpiryTracked: !!isExpiryTracked } : {})\n      }");

// 4. Append new routes
const newRoutes = `
// Create a batch
router.post('/:id/batches', authenticate, async (req, res) => {
  try {
    const { batchNumber, expiryDate } = req.body;
    const productId = req.params.id;
    if (!batchNumber) return res.status(400).json({ error: 'Batch number is required' });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isBatchTracked) return res.status(400).json({ error: 'Product not found or not batch tracked' });
    
    const batch = await prisma.productBatch.create({
      data: {
        productId,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });
    return res.json({ batch });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Batch number already exists for this product' });
    return res.status(500).json({ error: 'Error creating batch' });
  }
});

// Get FEFO batches
router.get('/:id/fefo-batches', authenticate, async (req, res) => {
  try {
    const productId = req.params.id;
    const batches = await prisma.productBatch.findMany({
      where: {
        productId,
        balances: { some: { quantity: { gt: 0 } } }
      },
      orderBy: [
        { expiryDate: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        balances: { include: { location: { include: { warehouse: true } } } }
      }
    });
    return res.json({ batches });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching FEFO batches' });
  }
});
`;

c = c.replace(/export default router;/g, newRoutes + '\nexport default router;');

fs.writeFileSync(p, c);
console.log('patched');

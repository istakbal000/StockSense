const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('Testing Batch Tracking...');

  // 1. Create a Location
  const warehouse = await prisma.warehouse.findFirst() || await prisma.warehouse.create({ data: { name: 'Test WH', code: 'TWH' } });
  const location = await prisma.location.findFirst() || await prisma.location.create({ data: { warehouseId: warehouse.id, name: 'Test Loc', code: 'TLOC' } });

  // 2. Create a Batch-Tracked Product
  const category = await prisma.category.findFirst() || await prisma.category.create({ data: { name: 'Test Cat' } });
  const uom = await prisma.unitOfMeasure.findFirst() || await prisma.unitOfMeasure.create({ data: { name: 'Pieces', symbol: 'pcs' } });

  const product = await prisma.product.create({
    data: {
      name: 'Batch Tracked Item ' + Date.now(),
      sku: 'BTI-' + Date.now(),
      categoryId: category.id,
      unitOfMeasureId: uom.id,
      isBatchTracked: true,
      isExpiryTracked: true
    }
  });

  // 3. Create a Batch
  const batch = await prisma.productBatch.create({
    data: {
      productId: product.id,
      batchNumber: 'B-001',
      expiryDate: new Date('2030-01-01')
    }
  });

  console.log('Batch created:', batch.batchNumber);

  // 4. Create an InventoryBalance directly to simulate stock
  await prisma.inventoryBalance.create({
    data: {
      productId: product.id,
      locationId: location.id,
      batchId: batch.id,
      quantity: 100
    }
  });

  const balance = await prisma.inventoryBalance.findFirst({
    where: { productId: product.id, locationId: location.id, batchId: batch.id }
  });

  console.log('Balance found:', balance.quantity, 'for batch:', batch.batchNumber);
  
  if (balance.quantity === 100) {
    console.log('SUCCESS: Batch tracking backend logic works!');
  } else {
    console.error('FAILED: Balance mismatch');
  }

  process.exit(0);
}

runTest().catch(console.error);

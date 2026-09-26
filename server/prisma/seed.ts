import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding StockSense database...');

  // Clean existing tables in dependency order
  await prisma.stockLedgerEntry.deleteMany();
  await prisma.inventoryAdjustment.deleteMany();
  await prisma.transferItem.deleteMany();
  await prisma.internalTransfer.deleteMany();
  await prisma.deliveryItem.deleteMany();
  await prisma.deliveryOrder.deleteMany();
  await prisma.receiptItem.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.reorderingRule.deleteMany();
  await prisma.inventoryBalance.deleteMany();
  await prisma.product.deleteMany();
  await prisma.location.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.unitOfMeasure.deleteMany();
  await prisma.category.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const manager = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'manager@stocksense.com',
      passwordHash,
      role: 'Inventory Manager',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'staff@stocksense.com',
      passwordHash,
      role: 'Warehouse Staff',
    },
  });

  console.log('✅ Created users: manager@stocksense.com, staff@stocksense.com (Password: password123)');

  // 2. Seed Categories
  const catRaw = await prisma.category.create({
    data: { name: 'Raw Materials', description: 'Metals, plastics, and unprocessed raw materials' },
  });
  const catFinished = await prisma.category.create({
    data: { name: 'Finished Goods', description: 'Completed commercial goods ready for delivery' },
  });
  const catComponents = await prisma.category.create({
    data: { name: 'Components', description: 'Sub-assemblies and modular parts' },
  });
  const catHardware = await prisma.category.create({
    data: { name: 'Hardware', description: 'Fasteners, bolts, fittings, tools' },
  });

  // 3. Seed Units of Measure
  const uomKg = await prisma.unitOfMeasure.create({
    data: { name: 'Kilogram', symbol: 'kg' },
  });
  const uomUnit = await prisma.unitOfMeasure.create({
    data: { name: 'Unit / Piece', symbol: 'unit' },
  });
  const uomMeter = await prisma.unitOfMeasure.create({
    data: { name: 'Meter', symbol: 'm' },
  });
  const uomBox = await prisma.unitOfMeasure.create({
    data: { name: 'Box (10x)', symbol: 'box' },
  });

  // 4. Seed Warehouses
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',
      code: 'MWH-01',
      address: '742 Evergreen Industrial Pkwy, Sector 4',
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: 'Warehouse 2',
      code: 'WH2-02',
      address: '108 Logistics Boulevard, Terminal 9',
    },
  });

  // 5. Seed Locations
  const locMainStore = await prisma.location.create({
    data: { warehouseId: mainWarehouse.id, name: 'Main Store', code: 'MAIN-STORE', type: 'Floor' },
  });
  const locRackA = await prisma.location.create({
    data: { warehouseId: mainWarehouse.id, name: 'Rack A', code: 'RACK-A', type: 'Rack' },
  });
  const locRackB = await prisma.location.create({
    data: { warehouseId: mainWarehouse.id, name: 'Rack B', code: 'RACK-B', type: 'Rack' },
  });
  const locProdRack = await prisma.location.create({
    data: { warehouseId: mainWarehouse.id, name: 'Production Rack', code: 'PROD-RACK', type: 'Production' },
  });

  const locWh2RackA = await prisma.location.create({
    data: { warehouseId: warehouse2.id, name: 'Rack A', code: 'WH2-RACK-A', type: 'Rack' },
  });
  const locWh2Staging = await prisma.location.create({
    data: { warehouseId: warehouse2.id, name: 'Dispatch Staging', code: 'WH2-STAGE', type: 'Staging' },
  });

  // 6. Seed Products
  const steelRod = await prisma.product.create({
    data: {
      name: 'Steel Rods',
      sku: 'STL-001',
      categoryId: catRaw.id,
      unitOfMeasureId: uomKg.id,
      initialStock: 60,
    },
  });

  const chairs = await prisma.product.create({
    data: {
      name: 'Ergonomic Chairs',
      sku: 'CHR-101',
      categoryId: catFinished.id,
      unitOfMeasureId: uomUnit.id,
      initialStock: 25,
    },
  });

  const tables = await prisma.product.create({
    data: {
      name: 'Modular Tables',
      sku: 'TBL-202',
      categoryId: catFinished.id,
      unitOfMeasureId: uomUnit.id,
      initialStock: 4,
    },
  });

  const frames = await prisma.product.create({
    data: {
      name: 'Structural Frames',
      sku: 'FRM-303',
      categoryId: catComponents.id,
      unitOfMeasureId: uomUnit.id,
      initialStock: 0,
    },
  });

  // 7. Seed Initial Balances & Ledger Records
  // Steel Rods: 40 at Main Store, 20 at Rack B
  await prisma.inventoryBalance.create({
    data: { productId: steelRod.id, locationId: locMainStore.id, quantity: 40 },
  });
  await prisma.inventoryBalance.create({
    data: { productId: steelRod.id, locationId: locRackB.id, quantity: 20 },
  });
  await prisma.stockLedgerEntry.create({
    data: {
      movementType: 'INITIAL_STOCK',
      referenceDocument: 'INIT-001',
      productId: steelRod.id,
      quantity: 40,
      toLocationId: locMainStore.id,
      notes: 'Initial inventory setup',
      userId: manager.id,
    },
  });
  await prisma.stockLedgerEntry.create({
    data: {
      movementType: 'INITIAL_STOCK',
      referenceDocument: 'INIT-002',
      productId: steelRod.id,
      quantity: 20,
      toLocationId: locRackB.id,
      notes: 'Initial inventory setup',
      userId: manager.id,
    },
  });

  // Chairs: 25 at Rack A
  await prisma.inventoryBalance.create({
    data: { productId: chairs.id, locationId: locRackA.id, quantity: 25 },
  });
  await prisma.stockLedgerEntry.create({
    data: {
      movementType: 'INITIAL_STOCK',
      referenceDocument: 'INIT-003',
      productId: chairs.id,
      quantity: 25,
      toLocationId: locRackA.id,
      notes: 'Initial showroom stock',
      userId: manager.id,
    },
  });

  // Tables: 4 at Rack A (Low Stock scenario!)
  await prisma.inventoryBalance.create({
    data: { productId: tables.id, locationId: locRackA.id, quantity: 4 },
  });
  await prisma.stockLedgerEntry.create({
    data: {
      movementType: 'INITIAL_STOCK',
      referenceDocument: 'INIT-004',
      productId: tables.id,
      quantity: 4,
      toLocationId: locRackA.id,
      notes: 'Initial display tables',
      userId: manager.id,
    },
  });

  // Frames: 0 (Out of stock scenario)
  await prisma.inventoryBalance.create({
    data: { productId: frames.id, locationId: locProdRack.id, quantity: 0 },
  });

  // 8. Reordering Rules
  await prisma.reorderingRule.create({
    data: {
      productId: steelRod.id,
      locationId: locMainStore.id,
      minQuantity: 30,
      targetQuantity: 100,
    },
  });

  await prisma.reorderingRule.create({
    data: {
      productId: chairs.id,
      locationId: locRackA.id,
      minQuantity: 10,
      targetQuantity: 40,
    },
  });

  await prisma.reorderingRule.create({
    data: {
      productId: tables.id,
      locationId: locRackA.id,
      minQuantity: 10, // 4 current < 10 min -> LOW STOCK ALERT!
      targetQuantity: 30,
    },
  });

  await prisma.reorderingRule.create({
    data: {
      productId: frames.id,
      locationId: locProdRack.id,
      minQuantity: 5, // 0 current == OUT OF STOCK ALERT!
      targetQuantity: 25,
    },
  });

  // 9. Seed Sample In-Flight Operations (Pending Receipts, Deliveries, Transfers)
  // Pending Receipt: Waiting
  const receipt1 = await prisma.receipt.create({
    data: {
      receiptNumber: 'REC-2026-001',
      supplierName: 'Apex Industrial Steels Ltd',
      destinationLocationId: locMainStore.id,
      status: 'Ready',
      notes: 'Monthly batch delivery of structural raw materials',
      createdByUserId: manager.id,
      items: {
        create: [
          { productId: steelRod.id, quantity: 50, notes: 'Grade A 12mm rebar' },
        ],
      },
    },
  });

  // Pending Delivery: Waiting
  const delivery1 = await prisma.deliveryOrder.create({
    data: {
      orderNumber: 'DEL-2026-001',
      customerName: 'TechCorp Offices Inc',
      sourceLocationId: locRackA.id,
      status: 'Waiting',
      pickStatus: 'Pending',
      packStatus: 'Pending',
      notes: 'Expedited furniture dispatch for 5th floor renovation',
      createdByUserId: manager.id,
      items: {
        create: [
          { productId: chairs.id, quantity: 10, pickedQuantity: 0, packedQuantity: 0 },
        ],
      },
    },
  });

  // Scheduled Internal Transfer: Ready
  const transfer1 = await prisma.internalTransfer.create({
    data: {
      transferNumber: 'TRF-2026-001',
      sourceLocationId: locMainStore.id,
      destinationLocationId: locProdRack.id,
      status: 'Ready',
      notes: 'Transfer steel stock to production line for assembly',
      createdByUserId: staff.id,
      items: {
        create: [
          { productId: steelRod.id, quantity: 20 },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully with initial operations, products, and rules.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/prisma/schema.prisma';
let c = fs.readFileSync(p, 'utf8');

// 1. Update Product
c = c.replace(/updatedAt\s+DateTime\s+@updatedAt/, `updatedAt       DateTime @updatedAt
  isBatchTracked  Boolean @default(false)
  isExpiryTracked Boolean @default(false)`);

c = c.replace(/ledgerEntries\s+StockLedgerEntry\[\]/, `ledgerEntries   StockLedgerEntry[]
  batches         ProductBatch[]`);

// 2. Add ProductBatch Model
const batchModel = `
model ProductBatch {
  id          String    @id @default(uuid())
  productId   String
  batchNumber String
  expiryDate  DateTime?
  createdAt   DateTime  @default(now())

  product       Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  balances      InventoryBalance[]
  receiptItems  ReceiptItem[]
  deliveryItems DeliveryItem[]
  transferItems TransferItem[]
  adjustments   InventoryAdjustment[]
  ledgerEntries StockLedgerEntry[]

  @@unique([productId, batchNumber])
}
`;
c = c.replace(/model InventoryBalance/, batchModel + '\nmodel InventoryBalance');

// 3. Update InventoryBalance
c = c.replace(/quantity\s+Float\s+@default\(0\)/, `quantity   Float    @default(0)
  batchId    String?`);
c = c.replace(/location\s+Location\s+@relation\(fields: \[locationId\], references: \[id\], onDelete: Cascade\)/, `location Location @relation(fields: [locationId], references: [id], onDelete: Cascade)
  batch    ProductBatch? @relation(fields: [batchId], references: [id], onDelete: Cascade)`);
c = c.replace(/@@unique\(\[productId, locationId\]\)/, `// Removed unique constraint for batch tracking support`);

// 4. Update ReceiptItem
c = c.replace(/notes\s+String\?/, `notes     String?
  batchId   String?`);
c = c.replace(/product\s+Product\s+@relation\(fields: \[productId\], references: \[id\]\)/, `product Product @relation(fields: [productId], references: [id])
  batch   ProductBatch? @relation(fields: [batchId], references: [id])`);

// 5. Update DeliveryItem
c = c.replace(/packedQuantity\s+Float\s+@default\(0\)/, `packedQuantity Float   @default(0)
  batchId        String?`);
c = c.replace(/product\s+Product\s+@relation\(fields: \[productId\], references: \[id\]\)/, `product  Product       @relation(fields: [productId], references: [id])
  batch    ProductBatch? @relation(fields: [batchId], references: [id])`);

// 6. Update TransferItem
c = c.replace(/quantity\s+Float\n/, `quantity   Float
  batchId    String?\n`);
c = c.replace(/product\s+Product\s+@relation\(fields: \[productId\], references: \[id\]\)/, `product  Product          @relation(fields: [productId], references: [id])
  batch    ProductBatch?    @relation(fields: [batchId], references: [id])`);

// 7. Update InventoryAdjustment
c = c.replace(/difference\s+Float\n/, `difference       Float
  batchId          String?\n`);
c = c.replace(/location\s+Location\s+@relation\(fields: \[locationId\], references: \[id\]\)/, `location      Location  @relation(fields: [locationId], references: [id])
  batch         ProductBatch? @relation(fields: [batchId], references: [id])`);

// 8. Update StockLedgerEntry
c = c.replace(/toLocationId\s+String\?/, `toLocationId      String?
  batchId           String?`);
c = c.replace(/toLocation\s+Location\?\s+@relation\("LedgerTo", fields: \[toLocationId\], references: \[id\]\)/, `toLocation   Location? @relation("LedgerTo", fields: [toLocationId], references: [id])
  batch        ProductBatch? @relation(fields: [batchId], references: [id])`);

fs.writeFileSync(p, c);
console.log('Schema updated successfully');

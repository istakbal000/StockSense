const fs = require('fs');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/prisma/schema.prisma';
let c = fs.readFileSync(p, 'utf8');

const anomalyModel = `
model InventoryAnomaly {
  id                String   @id @default(uuid())
  type              String   // LARGE_ADJUSTMENT, REPEATED_CORRECTION
  severity          String   // HIGH, MEDIUM
  description       String
  productId         String?
  locationId        String?
  referenceDocument String?
  status            String   @default("OPEN") // OPEN, RESOLVED
  resolvedByUserId  String?
  resolutionNotes   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  product       Product?  @relation(fields: [productId], references: [id])
  location      Location? @relation(fields: [locationId], references: [id])
  resolvedByUser User?    @relation(fields: [resolvedByUserId], references: [id])
}
`;

fs.appendFileSync(p, '\n' + anomalyModel);
console.log('Appended InventoryAnomaly to schema.prisma');

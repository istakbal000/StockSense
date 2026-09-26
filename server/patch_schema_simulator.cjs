const fs = require('fs');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/prisma/schema.prisma';
let c = fs.readFileSync(p, 'utf8');

// Inject back-relations explicitly to avoid collision during format
c = c.replace(/model User \{/, "model User {\n  simulations   SimulationScenario[]");
c = c.replace(/model Product \{/, "model Product {\n  simEvents     SimulationEvent[]");
c = c.replace(/model Location \{/, "model Location {\n  simEventsFrom SimulationEvent[] @relation(\"SimSource\")\n  simEventsTo   SimulationEvent[] @relation(\"SimDest\")");

const simulatorModel = `
model SimulationScenario {
  id              String   @id @default(uuid())
  name            String
  description     String?
  createdByUserId String?
  createdAt       DateTime @default(now())

  createdByUser User?             @relation(fields: [createdByUserId], references: [id])
  events        SimulationEvent[]
}

model SimulationEvent {
  id                    String   @id @default(uuid())
  scenarioId            String
  eventType             String   // RECEIPT, DELIVERY, TRANSFER
  productId             String
  expectedDate          DateTime
  quantity              Float
  sourceLocationId      String?
  destinationLocationId String?

  scenario SimulationScenario @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
  product  Product            @relation(fields: [productId], references: [id])
  sourceLocation      Location? @relation("SimSource", fields: [sourceLocationId], references: [id])
  destinationLocation Location? @relation("SimDest", fields: [destinationLocationId], references: [id])
}
`;

fs.writeFileSync(p, c + '\n' + simulatorModel);
console.log('Appended Simulator models with explicit back-relations');

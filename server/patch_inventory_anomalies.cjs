const fs = require('fs');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/services/inventoryService.js';
let c = fs.readFileSync(p, 'utf8');

const anomalyLogic = `
      // Check for Anomalies
      const LARGE_ADJUSTMENT_THRESHOLD = 100;
      if (Math.abs(difference) > LARGE_ADJUSTMENT_THRESHOLD) {
        await tx.inventoryAnomaly.create({
          data: {
            type: 'LARGE_ADJUSTMENT',
            severity: 'HIGH',
            description: \`Adjustment of \${difference} units exceeds threshold of \${LARGE_ADJUSTMENT_THRESHOLD}\`,
            productId,
            locationId,
            referenceDocument: adjNum
          }
        });
      }

      // Check for Repeated Corrections
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCount = await tx.inventoryAdjustment.count({
        where: {
          productId,
          locationId,
          createdAt: { gte: sevenDaysAgo }
        }
      });

      if (recentCount >= 3) { // This is the 4th+ adjustment in 7 days
        await tx.inventoryAnomaly.create({
          data: {
            type: 'REPEATED_CORRECTION',
            severity: 'MEDIUM',
            description: \`More than 3 adjustments for this product/location in the last 7 days. Possible underlying issue.\`,
            productId,
            locationId,
            referenceDocument: adjNum
          }
        });
      }

      return adjustment;
`;

c = c.replace(/return adjustment;/g, anomalyLogic);

fs.writeFileSync(p, c);
console.log('Patched inventoryService.js for anomalies');

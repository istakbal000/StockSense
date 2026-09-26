const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/productRoutes.js';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/reorderingRules: \{\s*include: \{ location: true \}\s*\}/g, 
  "reorderingRules: { include: { location: true } },\n        batches: { orderBy: { expiryDate: 'asc' } }");

fs.writeFileSync(p, c);
console.log('patched GET / products');

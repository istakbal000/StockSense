const fs = require('fs');

function patchFile(path, replaceFrom, replaceTo) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(replaceFrom, replaceTo);
  fs.writeFileSync(path, c);
}

// 1. receiptRoutes.js
patchFile(
  'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/receiptRoutes.js',
  /quantity: Number\(item\.quantity\),\n\s*notes: item\.notes \|\| null\n\s*\}\)\)/g,
  "quantity: Number(item.quantity),\n            notes: item.notes || null,\n            batchId: item.batchId || null\n          }))"
);

// 2. deliveryRoutes.js
patchFile(
  'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/deliveryRoutes.js',
  /productId: item\.productId,\n\s*quantity: Number\(item\.quantity\)\n\s*\}\)\)/g,
  "productId: item.productId,\n            quantity: Number(item.quantity),\n            batchId: item.batchId || null\n          }))"
);

// 3. transferRoutes.js
patchFile(
  'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/transferRoutes.js',
  /productId: item\.productId,\n\s*quantity: Number\(item\.quantity\)\n\s*\}\)\)/g,
  "productId: item.productId,\n            quantity: Number(item.quantity),\n            batchId: item.batchId || null\n          }))"
);

// 4. adjustmentRoutes.js
patchFile(
  'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/adjustmentRoutes.js',
  /const \{ productId, locationId, physicalCount, reason \} = req\.body;/g,
  "const { productId, locationId, physicalCount, reason, batchId } = req.body;"
);
patchFile(
  'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/adjustmentRoutes.js',
  /await InventoryService\.applyAdjustment\(\n\s*productId,\n\s*locationId,\n\s*Number\(physicalCount\),\n\s*reason,\n\s*req\.user\?\.id\n\s*\);/g,
  "await InventoryService.applyAdjustment(\n      productId,\n      locationId,\n      Number(physicalCount),\n      reason,\n      req.user?.id,\n      batchId || null\n    );"
);

console.log('Routes patched for batchId');

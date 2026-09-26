const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes';
fs.readdirSync(dir).forEach(f => {
  if (!f.endsWith('.js')) return;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/err\.message\s*\|\|\s*/g, '');
  fs.writeFileSync(p, c);
  console.log('Updated ' + f);
});

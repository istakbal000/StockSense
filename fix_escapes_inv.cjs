const fs = require('fs');

function unescapeFile(path) {
  if (fs.existsSync(path)) {
    let c = fs.readFileSync(path, 'utf8');
    c = c.replace(/\\`/g, '`');
    c = c.replace(/\\\$/g, '$');
    fs.writeFileSync(path, c);
    console.log('Fixed:', path);
  } else {
    console.log('Not found:', path);
  }
}

unescapeFile('c:/Users/User/OneDrive/Desktop/StockSense/server/src/services/inventoryService.js');
console.log('Fixed escaping issues in inventoryService.js');

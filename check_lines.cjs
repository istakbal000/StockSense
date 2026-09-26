const fs = require('fs');
const lines = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx', 'utf8').split('\n');
console.log(lines.slice(665, 678).map((l, i) => `${666 + i}: ${l}`).join('\n'));

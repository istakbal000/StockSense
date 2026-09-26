const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

const productsSectionIndex = lines.findIndex(l => l.includes('{/* 2. Products Section */}'));

if (productsSectionIndex !== -1) {
  // Verify it needs fixing
  if (!lines[productsSectionIndex - 1].includes(')}')) {
    lines.splice(productsSectionIndex, 0, '      )}');
    fs.writeFileSync(p, lines.join('\n'));
    console.log('Fixed AppShell via splice!');
  } else {
    console.log('Already fixed!');
  }
} else {
  console.log('Not found');
}

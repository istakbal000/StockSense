const fs = require('fs');
const parser = require('@babel/parser');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

// Find the extra )} around line 157
// It's directly after </div>
for (let i = 150; i < 165; i++) {
  if (lines[i] && lines[i].trim() === ')}') {
    lines.splice(i, 1);
    console.log('Removed extra )} at line', i);
    break;
  }
}

try {
  parser.parse(lines.join('\n'), {
    sourceType: 'module',
    plugins: ['jsx']
  });
  fs.writeFileSync(p, lines.join('\n'));
  console.log('AppShell JSX parsed successfully and saved!');
} catch (err) {
  console.error('AppShell Parse Error:', err.message);
}

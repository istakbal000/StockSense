const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('AppShell JSX parsed successfully!');
} catch (err) {
  console.error('AppShell Parse Error:', err.message);
}

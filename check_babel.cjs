const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('JSX parsed successfully!');
} catch (err) {
  console.error('Parse Error:', err.message);
}

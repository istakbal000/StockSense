const http = require('http');

http.get('http://localhost:5000/api/anomalies?status=OPEN', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Anomalies Error:', data));
});

http.get('http://localhost:5000/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Products Error:', data));
});

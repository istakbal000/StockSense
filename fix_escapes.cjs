const fs = require('fs');

function unescapeFile(path) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/\\`/g, '`');
  c = c.replace(/\\\$/g, '$');
  fs.writeFileSync(path, c);
}

unescapeFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/AnomaliesView.jsx');
unescapeFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/SimulationsView.jsx');
unescapeFile('c:/Users/User/OneDrive/Desktop/StockSense/server/src/routes/simulationRoutes.js');
console.log('Fixed escaping issues');

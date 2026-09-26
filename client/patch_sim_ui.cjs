const fs = require('fs');

// 1. api.js
let apiCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', 'utf8');
const simApi = `
  // Simulations
  getSimulations: () => request('/simulations'),
  createSimulation: (body) => request('/simulations', { method: 'POST', body: JSON.stringify(body) }),
  addSimulationEvent: (id, body) => request(\`/simulations/\${id}/events\`, { method: 'POST', body: JSON.stringify(body) }),
  runSimulation: (id) => request(\`/simulations/\${id}/run\`),

  // Ledger
`;
if (!apiCode.includes('getSimulations:')) {
  apiCode = apiCode.replace(/\/\/ Ledger/g, simApi);
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', apiCode);
}

// 2. App.jsx
let appCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/App.jsx', 'utf8');
if (!appCode.includes('SimulationsView')) {
  appCode = appCode.replace(/import \{ AnomaliesView \} from '\.\/views\/AnomaliesView';/g, 
    "import { AnomaliesView } from './views/AnomaliesView';\nimport { SimulationsView } from './views/SimulationsView';");
  appCode = appCode.replace(/\{activeView === 'anomalies' && <AnomaliesView \/>\}/g, 
    "{activeView === 'anomalies' && <AnomaliesView />}\n      {activeView === 'simulations' && <SimulationsView />}");
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/App.jsx', appCode);
}

// 3. AppShell.jsx
let shellCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', 'utf8');
if (!shellCode.includes("id: 'simulations'")) {
  shellCode = shellCode.replace(/AlertOctagon,/g, "AlertOctagon, LineChart,");
  shellCode = shellCode.replace(/\{ id: 'anomalies', label: 'Anomalies', icon: AlertOctagon, roles: \['Inventory Manager'\] \},/g, 
    "{ id: 'anomalies', label: 'Anomalies', icon: AlertOctagon, roles: ['Inventory Manager'] },\n  { id: 'simulations', label: 'Simulations', icon: LineChart, roles: ['Inventory Manager'] },");
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', shellCode);
}

console.log('Patched API, App, and AppShell for Simulations');

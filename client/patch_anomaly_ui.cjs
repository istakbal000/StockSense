const fs = require('fs');

// 1. Patch api.js
let apiCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', 'utf8');
const anomalyApi = `
  // Anomalies
  getAnomalies: (status) => request(\`/anomalies\${status && status !== 'all' ? \`?status=\${status}\` : ''}\`),
  resolveAnomaly: (id, resolutionNotes) => request(\`/anomalies/\${id}/resolve\`, { method: 'PUT', body: JSON.stringify({ resolutionNotes }) }),

  // Ledger
`;
apiCode = apiCode.replace(/\/\/ Ledger/g, anomalyApi);
fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', apiCode);

// 2. Patch App.jsx
let appCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/App.jsx', 'utf8');
appCode = appCode.replace(/import \{ ProfileView \} from '\.\/views\/ProfileView';/g, 
  "import { ProfileView } from './views/ProfileView';\nimport { AnomaliesView } from './views/AnomaliesView';");
appCode = appCode.replace(/\{activeView === 'warehouse-settings' && <WarehouseSettingsView \/>\}/g, 
  "{activeView === 'warehouse-settings' && <WarehouseSettingsView />}\n      {activeView === 'anomalies' && <AnomaliesView />}");
fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/App.jsx', appCode);

// 3. Patch AppShell.jsx
let shellCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', 'utf8');
shellCode = shellCode.replace(/FileText,/g, "FileText, AlertOctagon,");
shellCode = shellCode.replace(/\{ id: 'ledger', label: 'Stock Ledger', icon: FileText, roles: \['Inventory Manager'\] \},/g, 
  "{ id: 'ledger', label: 'Stock Ledger', icon: FileText, roles: ['Inventory Manager'] },\n  { id: 'anomalies', label: 'Anomalies', icon: AlertOctagon, roles: ['Inventory Manager'] },");
fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', shellCode);

console.log('Patched API, App, and AppShell');

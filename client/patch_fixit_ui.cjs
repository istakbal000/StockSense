const fs = require('fs');

// 1. api.js
let apiCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', 'utf8');
const fixitApi = `
  // Fix-It Mode
  getFixItIssues: () => request('/fixit/issues'),
  analyzeFixItIssue: (issue) => request('/fixit/analyze', { method: 'POST', body: JSON.stringify({ issue }) }),
  executeFixItAction: (actionType, payload) => request('/fixit/execute', { method: 'POST', body: JSON.stringify({ actionType, payload }) }),

  // Ledger
`;
if (!apiCode.includes('getFixItIssues:')) {
  apiCode = apiCode.replace(/\/\/ Ledger/g, fixitApi);
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', apiCode);
}

// 2. App.jsx
let appCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/App.jsx', 'utf8');
if (!appCode.includes('FixItView')) {
  appCode = appCode.replace(/import \{ DashboardView \} from '\.\/views\/DashboardView';/g, 
    "import { DashboardView } from './views/DashboardView';\nimport { FixItView } from './views/FixItView';");
  appCode = appCode.replace(/\{activeView === 'dashboard' && <DashboardView onNavigate=\{setActiveView\} \/>\}/g, 
    "{activeView === 'dashboard' && <DashboardView onNavigate={setActiveView} />}\n      {activeView === 'fixit' && <FixItView />}");
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/App.jsx', appCode);
}

// 3. AppShell.jsx
let shellCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', 'utf8');
if (!shellCode.includes("id: 'fixit'")) {
  shellCode = shellCode.replace(/import \{ \n  Package2,/g, "import { \n  Package2, Sparkles,");
  
  const fixitLink = `
  const navItems = [
    { id: 'fixit', label: 'AI Fix-It Mode', icon: Sparkles, roles: ['Inventory Manager', 'Warehouse Staff'] },`;
    
  shellCode = shellCode.replace(/const navItems = \[/g, fixitLink);
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', shellCode);
}

// 4. Also add a widget on DashboardView
let dashCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DashboardView.jsx', 'utf8');
if (!dashCode.includes('Fix-It Mode')) {
  const dashWidget = `
      {/* AI Fix-It Widget */}
      <div className="bg-slate-900 border border-purple-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-purple-900/10 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-purple-400">✨ StockSense Fix-It Mode</span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            AI-powered inventory exception-resolution assistant. Sense the Problem. Understand the Cause. Fix It Safely.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('fixit')}
          className="relative z-10 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-600/30 flex items-center justify-center whitespace-nowrap"
        >
          Review Issues
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  `;
  dashCode = dashCode.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">/g, dashWidget);
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DashboardView.jsx', dashCode);
}

console.log('Patched API, App, AppShell, Dashboard for FixIt');

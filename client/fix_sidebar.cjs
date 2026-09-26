const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add Icons
if (!c.includes('Sparkles')) {
  c = c.replace("PackageCheck } from", "PackageCheck, Sparkles, AlertOctagon, LineChart } from");
}

// 2. Add Intelligence Section
const intelligenceSection = `
      {/* Intelligence Section */}
      <div className="pt-3">
        <p className="px-3 py-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Intelligence
        </p>
        
        {user?.role !== 'Warehouse Staff' && (
        <button
        onClick={() => { setActiveView('anomalies'); setMobileMenuOpen(false); }}
        className={navItemClass(activeView === 'anomalies')}>
          <AlertOctagon className="w-4 h-4 text-slate-400" />
          <span>Anomalies</span>
        </button>
        )}
        
        {user?.role !== 'Warehouse Staff' && (
        <button
        onClick={() => { setActiveView('simulations'); setMobileMenuOpen(false); }}
        className={navItemClass(activeView === 'simulations')}>
          <LineChart className="w-4 h-4 text-slate-400" />
          <span>Simulations</span>
        </button>
        )}

        <button
        onClick={() => { setActiveView('fixit'); setMobileMenuOpen(false); }}
        className={navItemClass(activeView === 'fixit')}>
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-200 font-semibold text-[13px]">AI Fix-It Mode</span>
        </button>
      </div>

      {/* 4. Settings Section */}`;

if (!c.includes('AI Fix-It Mode')) {
  c = c.replace("{/* 4. Settings Section */}", intelligenceSection);
}

fs.writeFileSync(p, c);
console.log('Sidebar patched successfully!');

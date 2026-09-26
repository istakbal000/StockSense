const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/<button\s*\{user\?\.role !== 'Warehouse Staff' && \(/g, "{user?.role !== 'Warehouse Staff' && (\n            <button");
c = c.replace(/<span>Move History \(Ledger\)<\/span>\s*<\/button>/g, "<span>Move History (Ledger)</span>\n            </button>\n            )}");

c = c.replace(/\{\/\* 4\. Settings Section \*\/\}\s*<div className="pt-3">/g, "{/* 4. Settings Section */}\n      {user?.role !== 'Warehouse Staff' && (\n      <div className=\"pt-3\">");
c = c.replace(/<span>Warehouse<\/span>\s*<\/button>\s*<\/div>/g, "<span>Warehouse</span>\n        </button>\n      </div>\n      )}");

fs.writeFileSync(p, c);
console.log('AppShell fixed');

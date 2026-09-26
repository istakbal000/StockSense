const fs = require('fs');

// AppShell
let appShellCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', 'utf8');
appShellCode = appShellCode.replace(
  '        <span>Dashboard</span>\n      </button>\n\n      {/* 2. Products Section */}\n      <div className="pt-2">',
  '        <span>Dashboard</span>\n      </button>\n      )}\n\n      {/* 2. Products Section */}\n      <div className="pt-2">'
);
fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/components/layout/AppShell.jsx', appShellCode);

// DeliveriesView
let delCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx', 'utf8');
delCode = delCode.replace(
  '              </div>\n          }\n          </div>\n        }\n      </Modal>\n    </div>);',
  '              </div>\n            </div>\n          }\n          </div>\n        }\n      </Modal>\n    </div>);'
);
fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx', delCode);
console.log('Fixed both components');

const fs = require('fs');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/              <\/div>\n          \}\n          <\/div>/g, 
  "              </div>\n            </div>\n          }\n          </div>");

fs.writeFileSync(p, c);
console.log('Fixed missing closing tag in DeliveriesView.jsx');

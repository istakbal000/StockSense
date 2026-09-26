const fs = require('fs');
const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

// Find the line that has "Validate & Decrease Stock"
const validateLineIndex = lines.findIndex(l => l.includes('Validate & Decrease Stock'));

// The structure after validateLineIndex:
// 668: Validate & Decrease Stock
// 669: </button>
// 670: </div>
// 671: }
// 672: </div>
// 673: }
// 674: </Modal>

// We need to insert a </div> before the } on line 671.
// Let's just find the `}` after the `</div>` that follows `</button>`.

if (validateLineIndex !== -1) {
  lines.splice(validateLineIndex + 3, 0, '            </div>');
  fs.writeFileSync(p, lines.join('\n'));
  console.log('Fixed div successfully via array splice.');
} else {
  console.log('Could not find Validate line');
}

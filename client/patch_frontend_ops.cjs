const fs = require('fs');

function patchFile(path, replaceFrom, replaceTo) {
  if (fs.existsSync(path)) {
    let c = fs.readFileSync(path, 'utf8');
    c = c.replace(replaceFrom, replaceTo);
    fs.writeFileSync(path, c);
  }
}

const batchSelectUI = `
                  {products.find(p => p.id === item.productId)?.isBatchTracked && (
                    <div className="w-32">
                      <select
                        required
                        value={item.batchId || ''}
                        onChange={(e) => handleLineItemChange(idx, 'batchId', e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border-rose-500 px-2 py-1.5 text-xs text-white"
                      >
                        <option value="" disabled>Batch *</option>
                        {products.find(p => p.id === item.productId)?.batches?.map(b => (
                          <option key={b.id} value={b.id}>{b.batchNumber}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="w-28">
                    <input
                    type="number"`;

// Receipts
patchFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/ReceiptsView.jsx',
  /<div className="w-28">\s*<input\s*type="number"/g,
  batchSelectUI
);
patchFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/ReceiptsView.jsx',
  /\{ productId: '', quantity: '10', notes: '' \}/g,
  "{ productId: '', quantity: '10', notes: '', batchId: '' }"
);

// Deliveries
patchFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx',
  /<div className="w-28">\s*<input\s*type="number"/g,
  batchSelectUI
);
patchFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx',
  /\{ productId: '', quantity: '10' \}/g,
  "{ productId: '', quantity: '10', batchId: '' }"
);

// Transfers
patchFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/TransfersView.jsx',
  /<div className="w-28">\s*<input\s*type="number"/g,
  batchSelectUI
);
patchFile('c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/TransfersView.jsx',
  /\{ productId: '', quantity: '10' \}/g,
  "{ productId: '', quantity: '10', batchId: '' }"
);

// Adjustments
let adjPath = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/AdjustmentsView.jsx';
let c = fs.readFileSync(adjPath, 'utf8');

c = c.replace(/const \[formLocationId, setFormLocationId\] = useState\(''\);/g, 
  "const [formLocationId, setFormLocationId] = useState('');\n  const [formBatchId, setFormBatchId] = useState('');");

c = c.replace(/reason: formReason\n\s*\}\)/g, 
  "reason: formReason,\n        batchId: formBatchId\n      })");

c = c.replace(/setFormReason\(''\);\n\s*setCreateModalOpen\(false\);/g, 
  "setFormReason('');\n      setFormBatchId('');\n      setCreateModalOpen(false);");

c = c.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">/g, 
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {products.find(p => p.id === formProductId)?.isBatchTracked && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch *</label>
                  <select required value={formBatchId} onChange={e => setFormBatchId(e.target.value)} className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white">
                    <option value="" disabled>Select Batch</option>
                    {products.find(p => p.id === formProductId)?.batches?.map(b => (
                      <option key={b.id} value={b.id}>{b.batchNumber}</option>
                    ))}
                  </select>
                </div>
              )}`);

fs.writeFileSync(adjPath, c);
console.log('Frontend patched!');

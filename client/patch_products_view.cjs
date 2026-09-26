const fs = require('fs');

function patchFile(path, replaceFrom, replaceTo) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(replaceFrom, replaceTo);
  fs.writeFileSync(path, c);
}

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/ProductsView.jsx';

// 1. Add state
patchFile(p, 
  /const \[formInitialLocationId, setFormInitialLocationId\] = useState\(''\);/g,
  "const [formInitialLocationId, setFormInitialLocationId] = useState('');\n  const [formIsBatchTracked, setFormIsBatchTracked] = useState(false);\n  const [formIsExpiryTracked, setFormIsExpiryTracked] = useState(false);\n  const [batchesProduct, setBatchesProduct] = useState(null);\n  const [newBatchNo, setNewBatchNo] = useState('');\n  const [newBatchExpiry, setNewBatchExpiry] = useState('');"
);

// 2. Add to reset
patchFile(p,
  /setFormInitialStock\('0'\);\n\s*setCreateModalOpen\(false\);/g,
  "setFormInitialStock('0');\n      setFormIsBatchTracked(false);\n      setFormIsExpiryTracked(false);\n      setCreateModalOpen(false);"
);

// 3. Add to API calls (Create)
patchFile(p,
  /unitOfMeasureId: formUnitId,\n\s*initialStock: formInitialStock,\n\s*initialLocationId: formInitialLocationId/g,
  "unitOfMeasureId: formUnitId,\n        initialStock: formInitialStock,\n        initialLocationId: formInitialLocationId,\n        isBatchTracked: formIsBatchTracked,\n        isExpiryTracked: formIsExpiryTracked"
);

// 4. Add to Edit (populate state)
patchFile(p,
  /setEditProduct\(product\);\n\s*setFormName\(product\.name\);/g,
  "setEditProduct(product);\n    setFormName(product.name);\n    setFormIsBatchTracked(product.isBatchTracked || false);\n    setFormIsExpiryTracked(product.isExpiryTracked || false);"
);

// 5. Add to Edit (submit)
patchFile(p,
  /unitOfMeasureId: formUnitId\n\s*\}\);/g,
  "unitOfMeasureId: formUnitId,\n        isBatchTracked: formIsBatchTracked,\n        isExpiryTracked: formIsExpiryTracked\n      });"
);

// 6. Add to Modal UI (Create & Edit)
patchFile(p,
  /\{!\(editProduct\) && \(\n\s*<div className="space-y-4">/g,
  `<div className="flex items-center gap-6 mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={formIsBatchTracked} onChange={(e) => setFormIsBatchTracked(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500" />
                  Track Batches/Lots
                </label>
                {formIsBatchTracked && (
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={formIsExpiryTracked} onChange={(e) => setFormIsExpiryTracked(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500" />
                    Track Expiry Dates
                  </label>
                )}
              </div>
              {!(editProduct) && (
                <div className="space-y-4">`
);

// 7. Add Batches Button in Table Actions
patchFile(p,
  /<button\n\s*onClick=\{\(\) => handleEditClick\(p\)\}/g,
  `{p.isBatchTracked && (
                        <button
                          onClick={() => setBatchesProduct(p)}
                          className="p-1\.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          title="Manage Batches"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(p)}`
);

// 8. Render Batches Modal
patchFile(p,
  /\{categoryModalOpen && \(/g,
  `{batchesProduct && (
        <Modal title={\`Manage Batches: \${batchesProduct.name}\`} onClose={() => setBatchesProduct(null)}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Batch No" value={newBatchNo} onChange={e => setNewBatchNo(e.target.value)} className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" />
              {batchesProduct.isExpiryTracked && (
                <input type="date" value={newBatchExpiry} onChange={e => setNewBatchExpiry(e.target.value)} className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" />
              )}
              <button 
                onClick={async () => {
                  try {
                    await fetch(\`http://localhost:5000/api/products/\${batchesProduct.id}/batches\`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('token')}\` },
                      body: JSON.stringify({ batchNumber: newBatchNo, expiryDate: newBatchExpiry || null })
                    });
                    setNewBatchNo('');
                    setNewBatchExpiry('');
                    loadData();
                    setFeedback({ type: 'success', message: 'Batch created successfully' });
                    setBatchesProduct(null);
                  } catch(e) {
                    setFeedback({ type: 'error', message: 'Failed to create batch' });
                  }
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              >
                Add Batch
              </button>
            </div>
            
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Existing Batches</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {batchesProduct.batches?.length > 0 ? batchesProduct.batches.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{b.batchNumber}</div>
                      {b.expiryDate && <div className="text-xs text-slate-400">Expires: {new Date(b.expiryDate).toLocaleDateString()}</div>}
                    </div>
                  </div>
                )) : <div className="text-xs text-slate-500">No batches created yet.</div>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {categoryModalOpen && (`
);

console.log('ProductsView patched');

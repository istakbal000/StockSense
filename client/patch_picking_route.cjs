const fs = require('fs');

const p = 'c:/Users/User/OneDrive/Desktop/StockSense/client/src/views/DeliveriesView.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add picking route state & function
c = c.replace(/const \[selectedDelivery, setSelectedDelivery\] = useState\(null\);/g, 
  `const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [pickingRoute, setPickingRoute] = useState(null);

  const fetchPickingRoute = async (deliveryId) => {
    try {
      const res = await fetch(\`http://localhost:5000/api/deliveries/\${deliveryId}/picking-route\`, {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      const data = await res.json();
      setPickingRoute(data.pickingRoute);
    } catch(err) {
      setFeedback({ type: 'error', message: 'Failed to generate picking route' });
    }
  };`
);

// 2. Clear picking route when modal closes
c = c.replace(/onClose=\{.*setSelectedDelivery\(null\).*\}/g,
  "onClose={() => { setSelectedDelivery(null); setPickingRoute(null); }}"
);

// 3. Inject Picking UI in Modal
const pickingUI = `
            {selectedDelivery.status !== 'Done' && selectedDelivery.status !== 'Canceled' &&
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
            
            <button
                  onClick={() => fetchPickingRoute(selectedDelivery.id)}
                  className="w-full py-2 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs font-semibold border border-purple-500/30 transition-colors"
                >
                  Generate Optimized Picking Route
            </button>
            
            {pickingRoute && (
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Optimized Route (FEFO / Location Sorted)</h4>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="pb-1">Loc</th>
                      <th className="pb-1">Product</th>
                      <th className="pb-1 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pickingRoute.map((step, i) => (
                      <tr key={i} className={step.isShortfall ? 'text-rose-400 font-medium' : 'text-slate-300'}>
                        <td className="py-1 font-mono text-[10px]">{step.locationCode}</td>
                        <td className="py-1 truncate max-w-[120px]">{step.productName} {step.batchNumber ? \`(Batch: \${step.batchNumber})\` : ''}</td>
                        <td className="py-1 text-right font-mono font-bold">{step.quantityToPick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">`;

c = c.replace(/\{selectedDelivery\.status !== 'Done' && selectedDelivery\.status !== 'Canceled' &&\n\s*<div className="pt-3 border-t border-slate-800 flex justify-end gap-2">/g, pickingUI);

fs.writeFileSync(p, c);
console.log('Picking route frontend UI patched');

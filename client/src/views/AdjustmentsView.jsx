import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calculator,
  History,
  MapPin,
  ArrowRight } from
'lucide-react';
import { api } from '../services/api';

import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const AdjustmentsView = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [search, setSearch] = useState('');

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [recordedStock, setRecordedStock] = useState(0);
  const [physicalCount, setPhysicalCount] = useState('0');
  const [reason, setReason] = useState('Physical inventory count reconciliation');

  // Feedback
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adjRes, prodRes, locRes] = await Promise.all([
      api.getAdjustments({ search: search.trim() || undefined }),
      api.getProducts(),
      api.getLocations()]
      );

      setAdjustments(adjRes.adjustments || []);
      setProducts(prodRes.products || []);
      setLocations(locRes.locations || []);

      if (prodRes.products?.length > 0 && !selectedProductId) {
        setSelectedProductId(prodRes.products[0].id);
      }
      if (locRes.locations?.length > 0 && !selectedLocationId) {
        setSelectedLocationId(locRes.locations[0].id);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Error loading adjustments' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch recorded stock preview whenever product or location changes
  useEffect(() => {
    const fetchRecorded = async () => {
      if (selectedProductId && selectedLocationId) {
        try {
          const res = await api.getAdjustmentPreview(selectedProductId, selectedLocationId);
          setRecordedStock(res.recordedQuantity || 0);
          setPhysicalCount(String(res.recordedQuantity || 0));
        } catch {
          setRecordedStock(0);
          setPhysicalCount('0');
        }
      }
    };
    fetchRecorded();
  }, [selectedProductId, selectedLocationId]);

  const parsedPhysical = Number(physicalCount) || 0;
  const difference = parsedPhysical - recordedStock;

  const handleApplyAdjustment = async (e) => {
    e.preventDefault();
    try {
      await api.applyAdjustment({
        productId: selectedProductId,
        locationId: selectedLocationId,
        physicalCount: parsedPhysical,
        reason: reason || 'Inventory cycle count reconciliation'
      });

      setFeedback({
        type: 'success',
        message: `Adjustment applied successfully! Stock updated to ${parsedPhysical} and logged in Stock Ledger.`
      });
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error applying adjustment' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Feedback Alert */}
      {feedback &&
      <div
        className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
        feedback.type === 'success' ?
        'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
        'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`
        }>
        
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline">
            Dismiss
          </button>
        </div>
      }

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Inventory Adjustments</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fix mismatches between recorded system stock and physical count (e.g. damaged steel, cycle counting). Formula: <span className="font-mono text-purple-300 font-semibold">Difference = Physical Count - Recorded Stock</span>.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto">
          
          <Plus className="w-4 h-4" />
          <span>New Adjustment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800">
        <form onSubmit={(e) => {e.preventDefault();loadData();}} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search adjustments by document number, product name, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
          
        </form>
      </div>

      {/* Adjustments Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {adjustments.length === 0 ?
        <div className="p-12 text-center text-slate-400">
            <ClipboardCheck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No inventory adjustments recorded yet.</p>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Adjustment #</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Warehouse & Location</th>
                  <th className="py-3 px-4">Recorded Stock</th>
                  <th className="py-3 px-4">Physical Count</th>
                  <th className="py-3 px-4">Difference</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {adjustments.map((a) =>
              <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{a.adjustmentNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-100">{a.product?.name}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{a.product?.sku}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200">{a.location?.name}</span>
                      <span className="block text-[10px] text-slate-500">{a.location?.warehouse?.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {a.recordedQuantity} {a.product?.unitOfMeasure?.symbol}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {a.physicalCount} {a.product?.unitOfMeasure?.symbol}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    a.difference > 0 ?
                    'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' :
                    a.difference < 0 ?
                    'bg-rose-950/60 text-rose-400 border border-rose-500/30' :
                    'bg-slate-800 text-slate-400'}`
                    }>
                    
                        {a.difference > 0 ? `+${a.difference}` : a.difference} {a.product?.unitOfMeasure?.symbol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{a.reason || 'Cycle count'}</td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* Modal: New Adjustment */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Physical Inventory Adjustment"
        maxWidth="lg">
        
        <form onSubmit={handleApplyAdjustment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Product *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/50">
              
              {products.map((p) =>
              <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) &middot; Total Company Stock: {p.totalStock} {p.unitOfMeasure?.symbol}
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Location to Count *</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/50">
              
              {locations.map((loc) =>
              <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.warehouse?.name || 'Warehouse'})
                </option>
              )}
            </select>
          </div>

          {/* Real-Time Calculation Display Card */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Recorded Stock:</span>
              <span className="font-mono font-bold text-white text-sm">{recordedStock} units</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Enter Physical / Counted Quantity *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                placeholder="e.g. 97"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-base font-mono font-bold text-white focus:ring-2 focus:ring-purple-500/50" />
              
            </div>

            <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Adjustment Difference:</span>
                <p className="text-[10px] text-slate-400">Physical Count - Recorded Stock</p>
              </div>
              <div
                className={`text-lg font-mono font-black ${
                difference > 0 ? 'text-emerald-400' : difference < 0 ? 'text-rose-400' : 'text-slate-300'}`
                }>
                
                {difference > 0 ? `+${difference}` : difference}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Reason / Notes</label>
            <input
              type="text"
              required
              placeholder="e.g. 3 kg steel damaged, annual inventory audit, scrap"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/50" />
            
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30">
              
              Apply Adjustment & Update Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>);

};
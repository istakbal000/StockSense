import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Search,
  MapPin,
  ArrowRight } from
'lucide-react';
import { api } from '../services/api';

import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const TransfersView = () => {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Form State
  const [sourceLocId, setSourceLocId] = useState('');
  const [destLocId, setDestLocId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('10');

  // Dynamic stock preview during transfer creation
  const [sourceAvailable, setSourceAvailable] = useState(null);
  const [destAvailable, setDestAvailable] = useState(null);

  // Feedback
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trfRes, prodRes, locRes] = await Promise.all([
      api.getTransfers({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search.trim() || undefined
      }),
      api.getProducts(),
      api.getLocations()]
      );

      setTransfers(trfRes.transfers || []);
      setProducts(prodRes.products || []);
      setLocations(locRes.locations || []);

      if (locRes.locations?.length >= 2) {
        if (!sourceLocId) setSourceLocId(locRes.locations[0].id);
        if (!destLocId) setDestLocId(locRes.locations[1].id);
      }
      if (prodRes.products?.length > 0 && !selectedProductId) {
        setSelectedProductId(prodRes.products[0].id);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Error loading transfers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  // Update source and destination stock preview
  useEffect(() => {
    const updatePreview = async () => {
      if (selectedProductId && sourceLocId) {
        try {
          const res = await api.getAdjustmentPreview(selectedProductId, sourceLocId);
          setSourceAvailable(res.recordedQuantity);
        } catch {
          setSourceAvailable(0);
        }
      }
      if (selectedProductId && destLocId) {
        try {
          const res = await api.getAdjustmentPreview(selectedProductId, destLocId);
          setDestAvailable(res.recordedQuantity);
        } catch {
          setDestAvailable(0);
        }
      }
    };
    updatePreview();
  }, [selectedProductId, sourceLocId, destLocId]);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (sourceLocId === destLocId) {
      setFeedback({ type: 'error', message: 'Source location and destination location must be different.' });
      return;
    }

    try {
      await api.createTransfer({
        sourceLocationId: sourceLocId,
        destinationLocationId: destLocId,
        notes,
        status: 'Ready',
        items: [{ productId: selectedProductId, quantity: Number(transferQuantity) }]
      });

      setFeedback({
        type: 'success',
        message: 'Internal transfer scheduled and ready for validation.'
      });
      setCreateModalOpen(false);
      setNotes('');
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error creating transfer' });
    }
  };

  const handleValidateTransfer = async (transferId) => {
    try {
      const res = await api.validateTransfer(transferId);
      setFeedback({
        type: 'success',
        message: res.message || 'Transfer completed! Stock locations updated; total company stock unchanged.'
      });
      if (selectedTransfer?.id === transferId) {
        setSelectedTransfer(res.transfer);
      }
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Validation failed. Check available stock at source.' });
    }
  };

  const handleCancelTransfer = async (transferId) => {
    try {
      await api.cancelTransfer(transferId);
      setFeedback({ type: 'success', message: 'Internal transfer canceled.' });
      if (selectedTransfer?.id === transferId) {
        setSelectedTransfer(null);
      }
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Cancellation failed' });
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
            <ArrowLeftRight className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Internal Transfers</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Move stock between locations within the company (e.g. Main Store → Production Rack). Source stock decreases, Destination stock increases, and total company stock remains unchanged.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto">
          
          <Plus className="w-4 h-4" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={(e) => {e.preventDefault();loadData();}} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transfer number (e.g. TRF-2026-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
          
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
            
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>

          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200">
            
            Filter
          </button>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {transfers.length === 0 ?
        <div className="p-12 text-center text-slate-400">
            <ArrowLeftRight className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No internal transfers found.</p>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Transfer #</th>
                  <th className="py-3 px-4">Source Location (From)</th>
                  <th className="py-3 px-4">Destination Location (To)</th>
                  <th className="py-3 px-4">Products & Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transfers.map((t) =>
              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{t.transferNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-100 font-medium">{t.sourceLocation?.name}</span>
                      <span className="block text-[10px] text-slate-500">
                        {t.sourceLocation?.warehouse?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-100 font-medium">{t.destinationLocation?.name}</span>
                      <span className="block text-[10px] text-slate-500">
                        {t.destinationLocation?.warehouse?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.items?.map((it, idx) =>
                  <div key={idx} className="font-mono text-purple-300 font-semibold">
                          {it.quantity} {it.product?.unitOfMeasure?.symbol} &middot; {it.product?.name}
                        </div>
                  )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                      onClick={() => setSelectedTransfer(t)}
                      title="View Transfer Details"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {t.status !== 'Done' && t.status !== 'Canceled' &&
                    <>
                            <button
                        onClick={() => handleValidateTransfer(t.id)}
                        title="Validate Transfer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-semibold transition-all">
                        
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Validate</span>
                            </button>

                            <button
                        onClick={() => handleCancelTransfer(t.id)}
                        title="Cancel Transfer"
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors">
                        
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                    }
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* 1. Modal: Create Transfer */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Internal Transfer"
        maxWidth="lg">
        
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product to Move *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">From Source Location *</label>
              <select
                value={sourceLocId}
                onChange={(e) => setSourceLocId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/50">
                
                {locations.map((loc) =>
                <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.warehouse?.name || 'Warehouse'})
                  </option>
                )}
              </select>
              {sourceAvailable !== null &&
              <p className="text-[11px] text-slate-400 mt-1">
                  Available at Source: <span className="font-bold text-white font-mono">{sourceAvailable}</span>
                </p>
              }
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">To Destination Location *</label>
              <select
                value={destLocId}
                onChange={(e) => setDestLocId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/50">
                
                {locations.map((loc) =>
                <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.warehouse?.name || 'Warehouse'})
                  </option>
                )}
              </select>
              {destAvailable !== null &&
              <p className="text-[11px] text-slate-400 mt-1">
                  Current at Destination: <span className="font-bold text-white font-mono">{destAvailable}</span>
                </p>
              }
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Transfer Quantity *</label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-purple-500/50" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Reason</label>
            <input
              type="text"
              placeholder="e.g. Move steel to production line for assembly"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/50" />
            
          </div>

          {/* Invariant Preview Box */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
            <p className="font-bold text-indigo-300 mb-1">Stock Conservation Invariant</p>
            <p className="text-slate-300 text-[11px]">
              Transferring <span className="font-mono font-bold text-white">{transferQuantity}</span> units will decrease source stock and increase destination stock by the exact same amount. Total company stock delta is strictly <span className="font-bold text-emerald-400">0</span>.
            </p>
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
              
              Create Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: View Details */}
      <Modal
        isOpen={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        title={`Internal Transfer — ${selectedTransfer?.transferNumber}`}>
        
        {selectedTransfer &&
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400">Movement Status:</span>
              <StatusBadge status={selectedTransfer.status} />
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Source</p>
                <p className="text-xs font-bold text-white">{selectedTransfer.sourceLocation?.name}</p>
                <p className="text-[10px] text-slate-400">{selectedTransfer.sourceLocation?.warehouse?.name}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Destination</p>
                <p className="text-xs font-bold text-white">{selectedTransfer.destinationLocation?.name}</p>
                <p className="text-[10px] text-slate-400">{selectedTransfer.destinationLocation?.warehouse?.name}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Items</p>
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
                {selectedTransfer.items?.map((it, idx) =>
              <div key={idx} className="p-3 flex items-center justify-between bg-slate-900/60">
                    <div>
                      <p className="text-xs font-bold text-white">{it.product?.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">SKU: {it.product?.sku}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-400">
                      {it.quantity} {it.product?.unitOfMeasure?.symbol}
                    </span>
                  </div>
              )}
              </div>
            </div>

            {selectedTransfer.status !== 'Done' && selectedTransfer.status !== 'Canceled' &&
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
              onClick={() => handleCancelTransfer(selectedTransfer.id)}
              className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-950/30">
              
                  Cancel Transfer
                </button>
                <button
              onClick={() => handleValidateTransfer(selectedTransfer.id)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30">
              
                  Validate Transfer
                </button>
              </div>
          }
          </div>
        }
      </Modal>
    </div>);

};
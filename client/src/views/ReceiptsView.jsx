import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  Plus,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  AlertCircle,
  Eye,
  Trash2 } from
'lucide-react';
import { api } from '../services/api';

import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const ReceiptsView = () => {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form State
  const [supplierName, setSupplierName] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([
  { productId: '', quantity: '10', notes: '' }]
  );

  // Feedback
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, prodRes, locRes] = await Promise.all([
      api.getReceipts({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search.trim() || undefined
      }),
      api.getProducts(),
      api.getLocations()]
      );

      setReceipts(recRes.receipts || []);
      setProducts(prodRes.products || []);
      setLocations(locRes.locations || []);

      if (locRes.locations?.length > 0 && !destinationLocationId) {
        setDestinationLocationId(locRes.locations[0].id);
      }
      if (prodRes.products?.length > 0 && lineItems[0].productId === '') {
        setLineItems([{ productId: prodRes.products[0].id, quantity: '50', notes: '' }]);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Error loading receipts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleAddLineItem = () => {
    const defaultProd = products.length > 0 ? products[0].id : '';
    setLineItems([...lineItems, { productId: defaultProd, quantity: '10', notes: '' }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, val) => {
    const updated = [...lineItems];
    updated[index][field] = val;
    setLineItems(updated);
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    try {
      const validItems = lineItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        notes: item.notes
      }));

      await api.createReceipt({
        supplierName,
        destinationLocationId,
        notes,
        status: 'Ready',
        items: validItems
      });

      setFeedback({
        type: 'success',
        message: 'Receipt created and marked Ready for inspection and validation.'
      });
      setCreateModalOpen(false);
      setSupplierName('');
      setNotes('');
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error creating receipt' });
    }
  };

  const handleValidateReceipt = async (receiptId) => {
    try {
      const res = await api.validateReceipt(receiptId);
      setFeedback({
        type: 'success',
        message: res.message || 'Receipt validated! Stock increased and ledger entry recorded.'
      });
      if (selectedReceipt?.id === receiptId) {
        setSelectedReceipt(res.receipt);
      }
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Validation failed' });
    }
  };

  const handleCancelReceipt = async (receiptId) => {
    try {
      await api.cancelReceipt(receiptId);
      setFeedback({ type: 'success', message: 'Receipt canceled.' });
      if (selectedReceipt?.id === receiptId) {
        setSelectedReceipt(null);
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
            <ArrowDownToLine className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Receipts (Incoming Goods)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Receive items from suppliers. Validating a receipt automatically increases stock at destination and generates a Stock Ledger event.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto">
          
          <Plus className="w-4 h-4" />
          <span>New Receipt</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={(e) => {e.preventDefault();loadData();}} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by receipt number (e.g. REC-2026-001) or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            
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

      {/* Receipts Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {receipts.length === 0 ?
        <div className="p-12 text-center text-slate-400">
            <ArrowDownToLine className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No receipts found.</p>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Destination Location</th>
                  <th className="py-3 px-4">Items / Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {receipts.map((r) => {
                const totalItemsQty = r.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{r.receiptNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-100">{r.supplierName}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-200">{r.destinationLocation?.name}</span>
                        <span className="block text-[10px] text-slate-500">
                          {r.destinationLocation?.warehouse?.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.items && r.items.length > 0 ?
                      <div className="space-y-0.5">
                            {r.items.map((it, idx) =>
                        <span key={idx} className="block text-slate-200">
                                {it.quantity} {it.product?.unitOfMeasure?.symbol} &middot; {it.product?.name}
                              </span>
                        )}
                          </div> :

                      <span>{totalItemsQty} units</span>
                      }
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                          onClick={() => setSelectedReceipt(r)}
                          title="View Receipt Details"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {r.status !== 'Done' && r.status !== 'Canceled' &&
                        <>
                              <button
                            onClick={() => handleValidateReceipt(r.id)}
                            title="Validate and Increase Stock"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-semibold transition-all">
                            
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Validate</span>
                              </button>

                              <button
                            onClick={() => handleCancelReceipt(r.id)}
                            title="Cancel Receipt"
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors">
                            
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                        }
                        </div>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* 1. Modal: Create Receipt */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Goods Receipt"
        maxWidth="xl">
        
        <form onSubmit={handleCreateReceipt} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier / Vendor Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Industrial Steels Ltd"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500/50" />
              
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Location *</label>
              <select
                value={destinationLocationId}
                onChange={(e) => setDestinationLocationId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500/50">
                
                {locations.map((loc) =>
                <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.warehouse?.name || 'Warehouse'})
                  </option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Invoice Ref</label>
            <input
              type="text"
              placeholder="e.g. Po-9921, batch delivery, bill of lading"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500/50" />
            
          </div>

          {/* Line Items */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Received Products & Quantities</span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) =>
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div className="flex-1">
                    <select
                    value={item.productId}
                    onChange={(e) => handleLineItemChange(idx, 'productId', e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white">
                    
                      {products.map((p) =>
                    <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                    )}
                    </select>
                  </div>

                  <div className="w-28">
                    <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white font-mono" />
                  
                  </div>

                  <button
                  type="button"
                  onClick={() => handleRemoveLineItem(idx)}
                  disabled={lineItems.length <= 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 disabled:opacity-30">
                  
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/30">
              
              Create Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: View Receipt Details */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title={`Receipt Details — ${selectedReceipt?.receiptNumber}`}
        maxWidth="lg">
        
        {selectedReceipt &&
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Supplier</p>
                <p className="text-sm font-bold text-white">{selectedReceipt.supplierName}</p>
              </div>
              <StatusBadge status={selectedReceipt.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Destination:</span>
                <p className="font-semibold text-white">
                  {selectedReceipt.destinationLocation?.name} ({selectedReceipt.destinationLocation?.warehouse?.name})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Date Created:</span>
                <p className="font-semibold text-white">
                  {new Date(selectedReceipt.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Products Received
              </p>
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
                {selectedReceipt.items?.map((it, idx) =>
              <div key={idx} className="p-3 flex items-center justify-between bg-slate-900/60">
                    <div>
                      <p className="text-xs font-bold text-white">{it.product?.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">SKU: {it.product?.sku}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      +{it.quantity} {it.product?.unitOfMeasure?.symbol}
                    </span>
                  </div>
              )}
              </div>
            </div>

            {selectedReceipt.status !== 'Done' && selectedReceipt.status !== 'Canceled' &&
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
              onClick={() => handleCancelReceipt(selectedReceipt.id)}
              className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-950/30">
              
                  Cancel Receipt
                </button>
                <button
              onClick={() => handleValidateReceipt(selectedReceipt.id)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/30">
              
                  Validate & Increase Stock
                </button>
              </div>
          }
          </div>
        }
      </Modal>
    </div>);

};
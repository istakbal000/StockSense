import React, { useState, useEffect } from 'react';
import {
  ArrowUpFromLine,
  Plus,
  CheckCircle2,
  Package,
  CheckSquare,
  AlertCircle,
  Eye,
  Trash2,
  Search } from
'lucide-react';
import { api } from '../services/api';

import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const DeliveriesView = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [pickingRoute, setPickingRoute] = useState(null);

  const fetchPickingRoute = async (deliveryId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/deliveries/${deliveryId}/picking-route`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPickingRoute(data.pickingRoute);
    } catch(err) {
      setFeedback({ type: 'error', message: 'Failed to generate picking route' });
    }
  };

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([
  { productId: '', quantity: '5' }]
  );

  // Feedback
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [delRes, prodRes, locRes] = await Promise.all([
      api.getDeliveries({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search.trim() || undefined
      }),
      api.getProducts(),
      api.getLocations()]
      );

      setDeliveries(delRes.deliveries || []);
      setProducts(prodRes.products || []);
      setLocations(locRes.locations || []);

      if (locRes.locations?.length > 0 && !sourceLocationId) {
        setSourceLocationId(locRes.locations[0].id);
      }
      if (prodRes.products?.length > 0 && lineItems[0].productId === '') {
        setLineItems([{ productId: '', quantity: '5' }]);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Error loading delivery orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleAddLineItem = () => {
    const defaultProd = '';
    setLineItems([...lineItems, { productId: defaultProd, quantity: '1' }]);
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

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      const validItems = lineItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity)
      }));

      await api.createDelivery({
        customerName,
        sourceLocationId,
        notes,
        status: 'Ready',
        items: validItems
      });

      setFeedback({
        type: 'success',
        message: 'Delivery order created. Proceed with picking and packing.'
      });
      setCreateModalOpen(false);
      setCustomerName('');
      setNotes('');
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error creating delivery order' });
    }
  };

  const handlePickItems = async (deliveryId) => {
    try {
      const res = await api.pickDelivery(deliveryId);
      setFeedback({ type: 'success', message: 'All items marked as Picked from warehouse racks!' });
      if (selectedDelivery?.id === deliveryId) {
        setSelectedDelivery(res.delivery);
      }
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Picking update failed' });
    }
  };

  const handlePackItems = async (deliveryId) => {
    try {
      const res = await api.packDelivery(deliveryId);
      setFeedback({ type: 'success', message: 'All items marked as Packed and ready for dispatch validation!' });
      if (selectedDelivery?.id === deliveryId) {
        setSelectedDelivery(res.delivery);
      }
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Packing update failed' });
    }
  };

  const handleValidateDelivery = async (deliveryId) => {
    try {
      const res = await api.validateDelivery(deliveryId);
      setFeedback({
        type: 'success',
        message: res.message || 'Delivery order validated! Stock decreased and ledger entry logged.'
      });
      if (selectedDelivery?.id === deliveryId) {
        setSelectedDelivery(res.delivery);
      }
      loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Validation failed. Check available stock.'
      });
    }
  };

  const handleCancelDelivery = async (deliveryId) => {
    try {
      await api.cancelDelivery(deliveryId);
      setFeedback({ type: 'success', message: 'Delivery order canceled.' });
      if (selectedDelivery?.id === deliveryId) {
        setSelectedDelivery(null);
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
            <ArrowUpFromLine className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Delivery Orders (Outgoing Goods)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch items for customer shipments. Workflow: Pick items → Pack items → Validate. Stock decreases automatically with Stock Ledger traceability.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto">
          
          <Plus className="w-4 h-4" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={(e) => {e.preventDefault();loadData();}} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order number (e.g. DEL-2026-001) or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            
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

      {/* Deliveries Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {deliveries.length === 0 ?
        <div className="p-12 text-center text-slate-400">
            <ArrowUpFromLine className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No delivery orders found.</p>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer / Destination</th>
                  <th className="py-3 px-4">Source Location</th>
                  <th className="py-3 px-4">Workflow Stages</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {deliveries.map((d) =>
              <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{d.orderNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">{d.customerName}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200">{d.sourceLocation?.name}</span>
                      <span className="block text-[10px] text-slate-500">
                        {d.sourceLocation?.warehouse?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      d.pickStatus === 'Picked' ?
                      'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'}`
                      }>
                      
                          1. Pick: {d.pickStatus}
                        </span>
                        <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      d.packStatus === 'Packed' ?
                      'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'}`
                      }>
                      
                          2. Pack: {d.packStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                      onClick={() => setSelectedDelivery(d)}
                      title="View Delivery Details"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {d.status !== 'Done' && d.status !== 'Canceled' &&
                    <>
                            {d.pickStatus !== 'Picked' &&
                      <button
                        onClick={() => handlePickItems(d.id)}
                        title="Pick Items from Warehouse"
                        className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[11px] font-semibold">
                        
                                Pick
                              </button>
                      }

                            {d.pickStatus === 'Picked' && d.packStatus !== 'Packed' &&
                      <button
                        onClick={() => handlePackItems(d.id)}
                        title="Pack Items for Dispatch"
                        className="px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold">
                        
                                Pack
                              </button>
                      }

                            <button
                        onClick={() => handleValidateDelivery(d.id)}
                        title="Validate & Deduct Stock"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-semibold transition-all">
                        
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Validate</span>
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

      {/* 1. Modal: Create Delivery Order */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Outgoing Delivery Order"
        maxWidth="xl">
        
        <form onSubmit={handleCreateDelivery} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer / Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. TechCorp Offices Inc, Client A"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500/50" />
              
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source Stock Location *</label>
              <select
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500/50">
                
                {locations.map((loc) =>
                <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.warehouse?.name || 'Warehouse'})
                  </option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Order Notes / Shipping Info</label>
            <input
              type="text"
              placeholder="e.g. Sales Order #104, priority dispatch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500/50" />
            
          </div>

          {/* Line Items */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Delivery Line Items</span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
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
                    
                      <option value="" disabled>Select Product</option>
                      {products.map((p) =>
                    <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) &middot; Total Stock: {p.totalStock} {p.unitOfMeasure?.symbol}
                        </option>
                    )}
                    </select>
                  </div>

                  
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30">
              
              Create Delivery
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: View Delivery Order Details & Workflow */}
      <Modal
        isOpen={!!selectedDelivery}
        onClose={() => { setSelectedDelivery(null); setPickingRoute(null); }}
        title={`Delivery Order Details — ${selectedDelivery?.orderNumber}`}
        maxWidth="lg">
        
        {selectedDelivery &&
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Customer</p>
                <p className="text-sm font-bold text-white">{selectedDelivery.customerName}</p>
              </div>
              <StatusBadge status={selectedDelivery.status} />
            </div>

            {/* Workflow Progress Bar */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Operational Workflow
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div
                className={`p-2 rounded-lg text-center border ${
                selectedDelivery.pickStatus === 'Picked' ?
                'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' :
                'bg-slate-900 border-slate-700 text-slate-400'}`
                }>
                
                  <p className="text-[10px] font-bold">1. PICK</p>
                  <p className="text-xs font-semibold">{selectedDelivery.pickStatus}</p>
                </div>
                <div
                className={`p-2 rounded-lg text-center border ${
                selectedDelivery.packStatus === 'Packed' ?
                'bg-blue-950/60 border-blue-500/40 text-blue-300' :
                'bg-slate-900 border-slate-700 text-slate-400'}`
                }>
                
                  <p className="text-[10px] font-bold">2. PACK</p>
                  <p className="text-xs font-semibold">{selectedDelivery.packStatus}</p>
                </div>
                <div
                className={`p-2 rounded-lg text-center border ${
                selectedDelivery.status === 'Done' ?
                'bg-indigo-950/60 border-indigo-500/40 text-indigo-300' :
                'bg-slate-900 border-slate-700 text-slate-400'}`
                }>
                
                  <p className="text-[10px] font-bold">3. VALIDATE</p>
                  <p className="text-xs font-semibold">{selectedDelivery.status === 'Done' ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Source Location:</span>
                <p className="font-semibold text-white">
                  {selectedDelivery.sourceLocation?.name} ({selectedDelivery.sourceLocation?.warehouse?.name})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Created:</span>
                <p className="font-semibold text-white">
                  {new Date(selectedDelivery.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Order Items & Picking
              </p>
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
                {selectedDelivery.items?.map((it, idx) =>
              <div key={idx} className="p-3 flex items-center justify-between bg-slate-900/60">
                    <div>
                      <p className="text-xs font-bold text-white">{it.product?.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">SKU: {it.product?.sku}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {it.quantity} {it.product?.unitOfMeasure?.symbol}
                    </span>
                  </div>
              )}
              </div>
            </div>

            
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
                        <td className="py-1 truncate max-w-[120px]">{step.productName} {step.batchNumber ? `(Batch: ${step.batchNumber})` : ''}</td>
                        <td className="py-1 text-right font-mono font-bold">{step.quantityToPick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                {selectedDelivery.pickStatus !== 'Picked' &&
            <button
              onClick={() => handlePickItems(selectedDelivery.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white">
              
                    Mark as Picked
                  </button>
            }

                {selectedDelivery.pickStatus === 'Picked' && selectedDelivery.packStatus !== 'Packed' &&
            <button
              onClick={() => handlePackItems(selectedDelivery.id)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white">
              
                    Mark as Packed
                  </button>
            }

                <button
              onClick={() => handleValidateDelivery(selectedDelivery.id)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/30">
              
                  Validate & Decrease Stock
                </button>
              </div>
            </div>
          }
          </div>
        }
      </Modal>
    </div>);

};
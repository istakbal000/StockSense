import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Layers,
  MapPin,
  Sliders,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink } from
'lucide-react';
import { api } from '../services/api';

import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';






export const ProductsView = ({
  initialSearchSku = '',
  defaultSubTab = 'products'
}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearchSku);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewStockProduct, setViewStockProduct] = useState(null);
  const [reorderProduct, setReorderProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(defaultSubTab === 'categories');

  // Create Product Form
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formUnitId, setFormUnitId] = useState('');
  const [formInitialStock, setFormInitialStock] = useState('0');
  const [formInitialLocationId, setFormInitialLocationId] = useState('');

  // Reorder Form
  const [minQty, setMinQty] = useState('10');
  const [targetQty, setTargetQty] = useState('50');

  // New Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Feedback
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, unitRes, locRes] = await Promise.all([
      api.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined
      }),
      api.getCategories(),
      api.getUnits(),
      api.getLocations()]
      );

      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      setUnits(unitRes.units || []);
      setLocations(locRes.locations || []);

      if (catRes.categories?.length > 0 && !formCategoryId) {
        setFormCategoryId(catRes.categories[0].id);
      }
      if (unitRes.units?.length > 0 && !formUnitId) {
        setFormUnitId(unitRes.units[0].id);
      }
      if (locRes.locations?.length > 0 && !formInitialLocationId) {
        setFormInitialLocationId(locRes.locations[0].id);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Error loading product data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: formName,
        sku: formSku,
        categoryId: formCategoryId,
        unitOfMeasureId: formUnitId,
        initialStock: Number(formInitialStock) || 0,
        initialLocationId: Number(formInitialStock) > 0 ? formInitialLocationId : undefined
      });

      setFeedback({ type: 'success', message: `Product "${formName}" created successfully!` });
      setCreateModalOpen(false);
      setFormName('');
      setFormSku('');
      setFormInitialStock('0');
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error creating product' });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      await api.updateProduct(editProduct.id, {
        name: editProduct.name,
        sku: editProduct.sku,
        categoryId: editProduct.categoryId,
        unitOfMeasureId: editProduct.unitOfMeasureId
      });

      setFeedback({ type: 'success', message: 'Product updated successfully!' });
      setEditProduct(null);
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating product' });
    }
  };

  const handleSaveReorderRule = async (e) => {
    e.preventDefault();
    if (!reorderProduct) return;
    try {
      await api.saveReorderRule(reorderProduct.id, {
        minQuantity: Number(minQty),
        targetQuantity: Number(targetQty)
      });

      setFeedback({ type: 'success', message: `Reordering rule saved for ${reorderProduct.name}!` });
      setReorderProduct(null);
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error saving rule' });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory({ name: newCatName, description: newCatDesc });
      setFeedback({ type: 'success', message: `Category "${newCatName}" added successfully!` });
      setNewCatName('');
      setNewCatDesc('');
      const catRes = await api.getCategories();
      setCategories(catRes.categories || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error creating category' });
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

      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products & Stock Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage SKUs, categories, units of measure, location-specific inventory, and automated reorder rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors">
            
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all">
            
            <Plus className="w-4 h-4" />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU code (e.g. STL-001) or Product Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            
            <option value="all">All Categories</option>
            {categories.map((c) =>
            <option key={c.id} value={c.id}>
                {c.name}
              </option>
            )}
          </select>

          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200">
            
            Search
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {products.length === 0 ?
        <div className="p-12 text-center text-slate-400">
            <Boxes className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No products found matching your search.</p>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit of Measure</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Reorder Min</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((p) =>
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{p.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">{p.name}</td>
                    <td className="py-3.5 px-4">{p.category?.name}</td>
                    <td className="py-3.5 px-4">{p.unitOfMeasure?.name} ({p.unitOfMeasure?.symbol})</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {p.totalStock} {p.unitOfMeasure?.symbol}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {p.reorderMin} {p.unitOfMeasure?.symbol}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.stockStatus || 'In Stock'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Location Stock Breakdown Button */}
                        <button
                      onClick={() => setViewStockProduct(p)}
                      title="View stock availability across warehouses & locations"
                      className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors">
                      
                          <MapPin className="w-3.5 h-3.5" />
                        </button>

                        {/* Reordering Rules Button */}
                        <button
                      onClick={() => {
                        setReorderProduct(p);
                        setMinQty(String(p.reorderMin || 10));
                        setTargetQty(String(p.reorderingRules?.[0]?.targetQuantity || 50));
                      }}
                      title="Configure Reordering Rules"
                      className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors">
                      
                          <Sliders className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Product Button */}
                        <button
                      onClick={() => setEditProduct(p)}
                      title="Edit Product Details"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* 1. Modal: Create Product */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Product">
        
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Steel Rods, Ergonomic Chair"
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SKU / Code *</label>
            <input
              type="text"
              required
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              placeholder="e.g. STL-001, CHR-101"
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50" />
            
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50">
                
                {categories.map((c) =>
                <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure *</label>
              <select
                value={formUnitId}
                onChange={(e) => setFormUnitId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50">
                
                {units.map((u) =>
                <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Initial Stock (Optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formInitialStock}
                  onChange={(e) => setFormInitialStock(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50" />
                
              </div>

              {Number(formInitialStock) > 0 &&
              <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Allocate to Location *</label>
                  <select
                  value={formInitialLocationId}
                  onChange={(e) => setFormInitialLocationId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50">
                  
                    {locations.map((loc) =>
                  <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.warehouse?.name || 'Warehouse'})
                      </option>
                  )}
                  </select>
                </div>
              }
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30">
              
              Create Product
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Stock Availability Per Location */}
      <Modal
        isOpen={!!viewStockProduct}
        onClose={() => setViewStockProduct(null)}
        title={`Stock Availability — ${viewStockProduct?.name} (${viewStockProduct?.sku})`}
        maxWidth="lg">
        
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Company Stock:</span>
            <span className="font-mono text-base font-extrabold text-indigo-300">
              {viewStockProduct?.totalStock} {viewStockProduct?.unitOfMeasure?.symbol}
            </span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quantity Stored by Warehouse & Location:
          </p>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {viewStockProduct?.balances && viewStockProduct.balances.length > 0 ?
            viewStockProduct.balances.map((b) =>
            <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{b.location?.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {b.location?.warehouse?.name} ({b.location?.type})
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {b.quantity} {viewStockProduct.unitOfMeasure?.symbol}
                  </span>
                </div>
            ) :

            <div className="p-4 text-center text-xs text-slate-500">
                No stock currently allocated to any location.
              </div>
            }
          </div>
        </div>
      </Modal>

      {/* 3. Modal: Reordering Rules */}
      <Modal
        isOpen={!!reorderProduct}
        onClose={() => setReorderProduct(null)}
        title={`Reordering Rules — ${reorderProduct?.name}`}>
        
        <form onSubmit={handleSaveReorderRule} className="space-y-4">
          <p className="text-xs text-slate-400">
            When total stock falls to or below the minimum threshold, StockSense triggers automated low-stock alerts.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Minimum Stock Threshold (Reorder Point) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Stock Quantity (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50" />
            
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setReorderProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-md shadow-amber-600/30">
              
              Save Rule
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Modal: Manage Categories */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Product Categories">
        
        <div className="space-y-5">
          <form onSubmit={handleCreateCategory} className="space-y-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <p className="text-xs font-bold text-white">Create New Category</p>
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Raw Materials)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50" />
            
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50" />
            
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white">
              
              Add Category
            </button>
          </form>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Existing Categories ({categories.length})
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {categories.map((c) =>
              <div key={c.id} className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{c.name}</p>
                    {c.description && <p className="text-[10px] text-slate-400">{c.description}</p>}
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                    {c._count?.products ?? 0} items
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* 5. Modal: Edit Product */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title={`Edit Product — ${editProduct?.sku}`}>
        
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={editProduct?.name || ''}
              onChange={(e) => setEditProduct((prev) => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50" />
            
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SKU / Code</label>
            <input
              type="text"
              required
              value={editProduct?.sku || ''}
              onChange={(e) => setEditProduct((prev) => prev ? { ...prev, sku: e.target.value } : null)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50" />
            
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setEditProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white">
              
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>);

};
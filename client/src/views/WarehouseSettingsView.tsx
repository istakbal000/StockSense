import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  CheckCircle2,
  AlertCircle,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { Warehouse, Location } from '../types';
import { Modal } from '../components/common/Modal';

export const WarehouseSettingsView: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createWhModal, setCreateWhModal] = useState(false);
  const [createLocModal, setCreateLocModal] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Form States
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locType, setLocType] = useState('Rack');

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getWarehouses();
      setWarehouses(res.warehouses || []);
      if (res.warehouses?.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(res.warehouses[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Error loading warehouse settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWarehouse({
        name: whName,
        code: whCode,
        address: whAddress,
      });

      setFeedback({ type: 'success', message: `Warehouse "${whName}" created successfully!` });
      setCreateWhModal(false);
      setWhName('');
      setWhCode('');
      setWhAddress('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error creating warehouse' });
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLocation({
        warehouseId: selectedWarehouseId,
        name: locName,
        code: locCode,
        type: locType,
      });

      setFeedback({ type: 'success', message: `Location "${locName}" added to warehouse!` });
      setCreateLocModal(false);
      setLocName('');
      setLocCode('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error creating location' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Warehouse & Location Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-warehouse hierarchy, racks, staging areas, and production locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateLocModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Location / Rack</span>
          </button>

          <button
            onClick={() => setCreateWhModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <div key={wh.id} className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-extrabold text-white">{wh.name}</h3>
                </div>
                <p className="text-xs font-mono text-indigo-400 mt-1">Code: {wh.code}</p>
                {wh.address && <p className="text-xs text-slate-400 mt-0.5">{wh.address}</p>}
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300">
                {wh.locations?.length || 0} locations
              </span>
            </div>

            {/* Locations within Warehouse */}
            <div className="pt-3 border-t border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Configured Storage Locations & Racks:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {wh.locations && wh.locations.length > 0 ? (
                  wh.locations.map((loc) => {
                    const totalItems = loc.balances?.reduce((sum, b) => sum + b.quantity, 0) || 0;
                    return (
                      <div
                        key={loc.id}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold text-white">{loc.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {loc.code} &middot; {loc.type}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {totalItems} units
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 py-2">No locations created yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Warehouse */}
      <Modal
        isOpen={createWhModal}
        onClose={() => setCreateWhModal(false)}
        title="Add New Warehouse"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Distribution Center 3"
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. DC-03"
              value={whCode}
              onChange={(e) => setWhCode(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Address</label>
            <input
              type="text"
              placeholder="e.g. 500 Freight Way, Bay 12"
              value={whAddress}
              onChange={(e) => setWhAddress(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setCreateWhModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
            >
              Create Warehouse
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Location */}
      <Modal
        isOpen={createLocModal}
        onClose={() => setCreateLocModal(false)}
        title="Add Storage Location / Rack"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Warehouse *</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rack C, Assembly Bay, Shelf 4"
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. RACK-C"
                value={locCode}
                onChange={(e) => setLocCode(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type *</label>
              <select
                value={locType}
                onChange={(e) => setLocType(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Rack">Rack</option>
                <option value="Floor">Floor</option>
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Shelf">Shelf</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setCreateLocModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

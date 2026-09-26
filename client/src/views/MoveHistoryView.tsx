import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  Package,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { StockLedgerEntry } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const MoveHistoryView: React.FC = () => {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [movementType, setMovementType] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getMoveHistory({
        movementType: movementType !== 'all' ? movementType : undefined,
        search: search.trim() || undefined,
      });
      setEntries(res.ledgerEntries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [movementType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Stock Ledger & Move History</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete, immutable audit trail of every inventory movement. Every validated receipt, delivery, transfer, and adjustment is recorded here.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference (e.g. REC-2026-001, DEL-2026-001), SKU, product, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Movement Types</option>
            <option value="RECEIPT">Receipt (Incoming)</option>
            <option value="DELIVERY">Delivery (Outgoing)</option>
            <option value="INTERNAL_TRANSFER">Internal Transfer</option>
            <option value="ADJUSTMENT">Inventory Adjustment</option>
            <option value="INITIAL_STOCK">Initial Stock</option>
          </select>

          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Move History Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No ledger movements found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Qty Change</th>
                  <th className="py-3 px-4">From Location</th>
                  <th className="py-3 px-4">To Location</th>
                  <th className="py-3 px-4">Reference Doc</th>
                  <th className="py-3 px-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={e.movementType} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{e.product?.name}</span>
                      <span className="block text-[10px] font-mono text-slate-400">SKU: {e.product?.sku}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={
                          e.movementType === 'RECEIPT' || (e.movementType === 'ADJUSTMENT' && e.quantity > 0)
                            ? 'text-emerald-400'
                            : e.movementType === 'DELIVERY' || (e.movementType === 'ADJUSTMENT' && e.quantity < 0)
                            ? 'text-rose-400'
                            : 'text-purple-400'
                        }
                      >
                        {e.movementType === 'INTERNAL_TRANSFER'
                          ? `↔ ${e.quantity}`
                          : e.quantity > 0
                          ? `+${e.quantity}`
                          : e.quantity}{' '}
                        {e.product?.unitOfMeasure?.symbol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {e.fromLocation ? (
                        <div>
                          <span className="text-slate-200">{e.fromLocation.name}</span>
                          <span className="block text-[10px] text-slate-500">
                            {e.fromLocation.warehouse?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {e.toLocation ? (
                        <div>
                          <span className="text-slate-200">{e.toLocation.name}</span>
                          <span className="block text-[10px] text-slate-500">
                            {e.toLocation.warehouse?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-300 font-semibold">
                      {e.referenceDocument}
                      {e.notes && <span className="block text-[10px] text-slate-400 font-sans font-normal truncate max-w-xs">{e.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {e.user?.name || 'System Operator'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

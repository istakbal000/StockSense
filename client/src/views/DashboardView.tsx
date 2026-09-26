import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardKPIs, AlertItem, Warehouse, Category } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActiveView } from '../components/layout/AppShell';

interface DashboardViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [alerts, setAlerts] = useState<{ lowStock: AlertItem[]; outOfStock: AlertItem[] }>({
    lowStock: [],
    outOfStock: [],
  });
  const [operations, setOperations] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic filter states
  const [filterDocType, setFilterDocType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, opsRes, whRes, catRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardOperations({
          docType: filterDocType,
          status: filterStatus,
          warehouseId: filterWarehouse,
          categoryId: filterCategory,
          search: filterSearch,
        }),
        api.getWarehouses(),
        api.getCategories(),
      ]);

      setKpis(sumRes.kpis);
      setAlerts(sumRes.alerts);
      setOperations(opsRes.operations || []);
      setWarehouses(whRes.warehouses || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDocType, filterStatus, filterWarehouse, filterCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Inventory Operations Snapshot</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-warehouse inventory status, operational alerts, and pending movements.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top-Row KPI Cards (Source Mandated 5 KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Products in Stock */}
        <KpiCard
          title="Total Products In Stock"
          value={kpis ? kpis.totalProductsInStock.toLocaleString() : '—'}
          subtitle={kpis ? `${kpis.inStockCount} of ${kpis.totalProductsCount} SKUs stocked` : undefined}
          icon={<Boxes className="w-5 h-5 text-indigo-400" />}
          variant="indigo"
          onClick={() => onNavigate('products')}
        />

        {/* KPI 2: Low Stock / Out of Stock Items */}
        <KpiCard
          title="Low / Out of Stock"
          value={kpis ? kpis.totalAlertsCount : '—'}
          subtitle={kpis ? `${kpis.outOfStockCount} out of stock, ${kpis.lowStockCount} low` : undefined}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          variant={kpis && kpis.totalAlertsCount > 0 ? 'amber' : 'emerald'}
          onClick={() => onNavigate('stock-availability')}
        />

        {/* KPI 3: Pending Receipts */}
        <KpiCard
          title="Pending Receipts"
          value={kpis ? kpis.pendingReceipts : '—'}
          subtitle="Incoming vendor shipments"
          icon={<ArrowDownToLine className="w-5 h-5 text-emerald-400" />}
          variant="emerald"
          onClick={() => onNavigate('receipts')}
        />

        {/* KPI 4: Pending Deliveries */}
        <KpiCard
          title="Pending Deliveries"
          value={kpis ? kpis.pendingDeliveries : '—'}
          subtitle="Customer shipments in queue"
          icon={<ArrowUpFromLine className="w-5 h-5 text-blue-400" />}
          variant="blue"
          onClick={() => onNavigate('deliveries')}
        />

        {/* KPI 5: Internal Transfers Scheduled */}
        <KpiCard
          title="Transfers Scheduled"
          value={kpis ? kpis.internalTransfersScheduled : '—'}
          subtitle="Inter-location movements"
          icon={<ArrowLeftRight className="w-5 h-5 text-purple-400" />}
          variant="purple"
          onClick={() => onNavigate('transfers')}
        />
      </div>

      {/* Active Low Stock & Out-of-Stock Alerts Panel */}
      {(alerts.lowStock.length > 0 || alerts.outOfStock.length > 0) && (
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Active Stock Condition Alerts</h2>
            </div>
            <button
              onClick={() => onNavigate('receipts')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Create Restocking Receipt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.outOfStock.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <StatusBadge status="Out of Stock" size="sm" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {item.sku}</p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Current Stock: <span className="font-bold text-rose-400">0 {item.unit}</span> (Min Threshold: {item.minQuantity})
                  </p>
                </div>
              </div>
            ))}

            {alerts.lowStock.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <StatusBadge status="Low Stock" size="sm" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {item.sku}</p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Current Stock: <span className="font-bold text-amber-400">{item.currentStock} {item.unit}</span> (Reorder at: {item.minQuantity})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Filters Section */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Dynamic Operational Filters</h3>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, partner, items..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </form>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Dimension 1: Document Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Document Type
            </label>
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Document Types</option>
              <option value="Receipts">Receipts (Incoming)</option>
              <option value="Delivery">Delivery Orders (Outgoing)</option>
              <option value="Internal">Internal Transfers</option>
              <option value="Adjustments">Inventory Adjustments</option>
            </select>
          </div>

          {/* Dimension 2: Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Dimension 3: Warehouse / Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Warehouse
            </label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dimension 4: Product Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Product Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Operations Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Operational Activity Feed ({operations.length})
            </h3>
          </div>
        </div>

        {operations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Boxes className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium">No operations matching the selected filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the filters or clearing the search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Doc #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Entity / Partner</th>
                  <th className="py-3 px-4">Warehouse & Location</th>
                  <th className="py-3 px-4">Items & Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {operations.map((op) => (
                  <tr key={`${op.docType}-${op.id}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{op.docNumber}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={op.docType} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{op.partner}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">{op.locationName}</span>
                      <span className="block text-[10px] text-slate-500">{op.warehouseName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {op.items && op.items.length > 0 ? (
                        <div className="space-y-0.5">
                          {op.items.map((it: any, idx: number) => (
                            <span key={idx} className="block text-[11px] text-slate-200">
                              {it.quantity} {it.unit} &middot; {it.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>{op.totalQuantity} units</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={op.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(op.date).toLocaleDateString()} {new Date(op.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

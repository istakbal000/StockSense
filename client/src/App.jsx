import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { AuthView } from './views/AuthView';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { FixItView } from './views/FixItView';
import { ProductsView } from './views/ProductsView';
import { ReceiptsView } from './views/ReceiptsView';
import { DeliveriesView } from './views/DeliveriesView';
import { TransfersView } from './views/TransfersView';
import { AdjustmentsView } from './views/AdjustmentsView';
import { MoveHistoryView } from './views/MoveHistoryView';
import { WarehouseSettingsView } from './views/WarehouseSettingsView';
import { ProfileView } from './views/ProfileView';
import { AnomaliesView } from './views/AnomaliesView';
import { SimulationsView } from './views/SimulationsView';
import { api } from './services/api';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [quickSearchSku, setQuickSearchSku] = useState('');
  const [alertCounts, setAlertCounts] = useState({ lowStock: 0, outOfStock: 0 });
  const [showAuth, setShowAuth] = useState(false);

  const loadAlertCounts = async () => {
    if (!user) return;
    try {
      const res = await api.getDashboardSummary();
      if (res?.kpis) {
        setAlertCounts({
          lowStock: res.kpis.lowStockCount || 0,
          outOfStock: res.kpis.outOfStockCount || 0
        });
      }
    } catch {

      // Ignore background refresh errors
    }};

  useEffect(() => {
    if (user) {
      loadAlertCounts();
      const interval = setInterval(loadAlertCounts, 15000); // 15s refresh
      return () => clearInterval(interval);
    } else {
      setActiveView('dashboard');
    }
  }, [user, activeView]);

  useEffect(() => {
    if (user?.role === 'Warehouse Staff') {
      const restricted = ['dashboard', 'products', 'stock-availability', 'categories', 'reordering-rules', 'move-history', 'warehouse-settings'];
      if (restricted.includes(activeView)) {
        setActiveView('receipts');
      }
    }
  }, [user, activeView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Initializing StockSense...
          </p>
        </div>
      </div>);

  }

  if (!user) {
    if (showAuth) {
      return (
        <div className="relative">
          <div className="absolute top-4 left-4 z-50">
            <button 
              onClick={() => setShowAuth(false)} 
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700 backdrop-blur-md shadow-lg flex items-center gap-2"
            >
              &larr; Back to site
            </button>
          </div>
          <AuthView />
        </div>
      );
    }
    return <LandingView onLogin={() => setShowAuth(true)} />;
  }

  const handleQuickSearch = (sku) => {
    setQuickSearchSku(sku);
    setActiveView('products');
  };

  return (
    <AppShell
      activeView={activeView}
      setActiveView={setActiveView}
      onQuickSearchSku={handleQuickSearch}
      lowStockCount={alertCounts.lowStock}
      outOfStockCount={alertCounts.outOfStock}>
      
      {activeView === 'dashboard' && <DashboardView onNavigate={setActiveView} />}
      {activeView === 'fixit' && <FixItView />}
      {activeView === 'products' &&
      <ProductsView
        initialSearchSku={quickSearchSku}
        defaultSubTab="products" />

      }
      {activeView === 'stock-availability' &&
      <ProductsView
        initialSearchSku=""
        defaultSubTab="stock-availability" />

      }
      {activeView === 'categories' &&
      <ProductsView
        initialSearchSku=""
        defaultSubTab="categories" />

      }
      {activeView === 'reordering-rules' &&
      <ProductsView
        initialSearchSku=""
        defaultSubTab="reordering-rules" />

      }
      {activeView === 'receipts' && <ReceiptsView />}
      {activeView === 'deliveries' && <DeliveriesView />}
      {activeView === 'transfers' && <TransfersView />}
      {activeView === 'adjustments' && <AdjustmentsView />}
      {activeView === 'move-history' && <MoveHistoryView />}
      {activeView === 'warehouse-settings' && <WarehouseSettingsView />}
      {activeView === 'anomalies' && <AnomaliesView />}
      {activeView === 'simulations' && <SimulationsView />}
      {activeView === 'profile' && <ProfileView />}
    </AppShell>);

};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>);

}
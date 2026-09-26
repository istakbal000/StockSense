import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  MapPin,
  Layers,
  Sliders,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  History,
  Building2,
  User,
  LogOut,
  Search,
  AlertTriangle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  PackageCheck, Sparkles, AlertOctagon, LineChart } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
























export const AppShell = ({
  activeView,
  setActiveView,
  onQuickSearchSku,
  lowStockCount = 0,
  outOfStockCount = 0,
  children
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const totalAlerts = lowStockCount + outOfStockCount;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onQuickSearchSku?.(searchQuery.trim());
      setActiveView('products');
    }
  };

  const navItemClass = (isActive) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
  isActive ?
  'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' :
  'text-slate-300 hover:text-white hover:bg-slate-850 hover:bg-slate-800/60'}`;


  const subNavItemClass = (isActive) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium pl-9 transition-all duration-150 ${
  isActive ?
  'text-indigo-400 bg-indigo-500/10 font-semibold' :
  'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`;


  const renderNavLinks = () =>
  <div className="flex flex-col gap-1 px-3 py-4">
      {/* 1. Dashboard */}
      {user?.role !== 'Warehouse Staff' && (
      <button
      onClick={() => {
        setActiveView('dashboard');
        setMobileMenuOpen(false);
      }}
      className={navItemClass(activeView === 'dashboard')}>
      
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
      </button>

      )}
      {/* 2. Products Section */}
      <div className="pt-2">
        <button
        onClick={() => setProductsOpen(!productsOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200">
        
          <span className="flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5 text-indigo-400" />
            Products
          </span>
          {productsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {productsOpen &&
      <div className="flex flex-col gap-0.5 mt-1">
            <button
          onClick={() => {
            setActiveView('products');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'products')}>
          
              <span>Products</span>
            </button>
            <button
          onClick={() => {
            setActiveView('stock-availability');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'stock-availability')}>
          
              <span>Stock Availability</span>
            </button>
            <button
          onClick={() => {
            setActiveView('categories');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'categories')}>
          
              <span>Categories</span>
            </button>
            <button
          onClick={() => {
            setActiveView('reordering-rules');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'reordering-rules')}>
          
              <span>Reordering Rules</span>
            </button>
          </div>
      }
      </div>

      {/* 3. Operations Section */}
      <div className="pt-2">
        <button
        onClick={() => setOperationsOpen(!operationsOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200">
        
          <span className="flex items-center gap-2">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
            Operations
          </span>
          {operationsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {operationsOpen &&
      <div className="flex flex-col gap-0.5 mt-1">
            <button
          onClick={() => {
            setActiveView('receipts');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'receipts')}>
          
              <ArrowDownToLine className="w-3 h-3 text-emerald-400" />
              <span>Receipts (Incoming)</span>
            </button>
            <button
          onClick={() => {
            setActiveView('deliveries');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'deliveries')}>
          
              <ArrowUpFromLine className="w-3 h-3 text-blue-400" />
              <span>Delivery Orders (Outgoing)</span>
            </button>
            <button
          onClick={() => {
            setActiveView('transfers');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'transfers')}>
          
              <ArrowLeftRight className="w-3 h-3 text-indigo-400" />
              <span>Internal Transfers</span>
            </button>
            <button
          onClick={() => {
            setActiveView('adjustments');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'adjustments')}>
          
              <ClipboardCheck className="w-3 h-3 text-purple-400" />
              <span>Inventory Adjustments</span>
            </button>
            {user?.role !== 'Warehouse Staff' && (
            <button
          onClick={() => {
            setActiveView('move-history');
            setMobileMenuOpen(false);
          }}
          className={subNavItemClass(activeView === 'move-history')}>
          
              <History className="w-3 h-3 text-amber-400" />
              <span>Move History (Ledger)</span>
            </button>
            )}
          </div>
      }
      </div>

      
      {/* Intelligence Section */}
      <div className="pt-3">
        <p className="px-3 py-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Intelligence
        </p>
        
        {user?.role !== 'Warehouse Staff' && (
        <button
        onClick={() => { setActiveView('anomalies'); setMobileMenuOpen(false); }}
        className={navItemClass(activeView === 'anomalies')}>
          <AlertOctagon className="w-4 h-4 text-slate-400" />
          <span>Anomalies</span>
        </button>
        )}
        
        {user?.role !== 'Warehouse Staff' && (
        <button
        onClick={() => { setActiveView('simulations'); setMobileMenuOpen(false); }}
        className={navItemClass(activeView === 'simulations')}>
          <LineChart className="w-4 h-4 text-slate-400" />
          <span>Simulations</span>
        </button>
        )}

        <button
        onClick={() => { setActiveView('fixit'); setMobileMenuOpen(false); }}
        className={navItemClass(activeView === 'fixit')}>
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-200 font-semibold text-[13px]">AI Fix-It Mode</span>
        </button>
      </div>

      {/* 4. Settings Section */}
      {user?.role !== 'Warehouse Staff' && (
      <div className="pt-3">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Settings
        </p>
        <button
        onClick={() => {
          setActiveView('warehouse-settings');
          setMobileMenuOpen(false);
        }}
        className={navItemClass(activeView === 'warehouse-settings')}>
        
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Warehouse</span>
        </button>
      </div>
      )}

      {/* 5. Left Sidebar Profile Menu */}
      <div className="pt-3 mt-auto">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Profile Menu
        </p>
        <button
        onClick={() => {
          setActiveView('profile');
          setMobileMenuOpen(false);
        }}
        className={navItemClass(activeView === 'profile')}>
        
          <User className="w-4 h-4 text-slate-400" />
          <span>My Profile</span>
        </button>
        <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors">
        
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>;


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              StockSense
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400/90 block">
              Modular IMS
            </span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>

        {/* Current User Quick Badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Staff'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen &&
      <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold text-white">StockSense</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
          </div>
        </div>
      }

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800">
              
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base md:text-lg font-bold text-white capitalize tracking-tight">
              {activeView.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search / SKU Query */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="SKU search (e.g. STL-001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-700/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              
            </form>

            {/* Low-Stock Alert Indicator Button */}
            {totalAlerts > 0 &&
            <button
              onClick={() => setActiveView('dashboard')}
              title={`${totalAlerts} items require attention`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all glow-amber">
              
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{totalAlerts} Alert{totalAlerts > 1 ? 's' : ''}</span>
              </button>
            }

            {/* Profile Menu Trigger */}
            <button
              onClick={() => setActiveView('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 transition-colors">
              
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-slate-200">{user?.name}</span>
            </button>
          </div>
        </header>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>);

};
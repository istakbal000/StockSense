import React from 'react';
import {
  Boxes, ArrowRight, CheckCircle2, Shield, User,
  Activity, Layers, MoveRight, ArrowDownToLine,
  ArrowUpFromLine, RefreshCw, FileSearch, HelpCircle,
  Database, AlertTriangle, Play, Menu, X
} from 'lucide-react';

export const LandingView = ({ onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen text-slate-100 font-sans overflow-x-hidden" style={{ backgroundColor: '#0b0f19' }}>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-md" style={{ backgroundColor: 'rgba(11,15,25,0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">StockSense</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Product', 'How It Works', 'Features', 'AI Intelligence'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors duration-150"
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={onLogin}
                className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onLogin}
                className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-md shadow-indigo-600/25"
              >
                Get Started
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-slate-400 hover:text-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 pt-2 pb-4 space-y-1 bg-slate-950/95 shadow-xl">
            {['Product', 'How It Works', 'Features', 'AI Intelligence'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {link}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button onClick={onLogin} className="w-full py-2.5 text-slate-300 font-medium text-sm">Log In</button>
              <button onClick={onLogin} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-colors">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center relative" id="product">
          {/* subtle background radial */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }} />

          <span className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10">
            AI-Powered Inventory Management
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-3xl leading-tight">
            Know Your Stock.<br className="hidden md:block" />
            <span className="text-indigo-400">Run Smarter.</span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed">
            StockSense brings products, warehouses, stock movements, alerts, and intelligent assistance into one centralized inventory platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto px-7 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Play className="w-4 h-4 text-slate-400" /> See How It Works
            </button>
          </div>

          {/* ── HERO DASHBOARD PREVIEW ── */}
          <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Window chrome */}
            <div className="h-11 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <div className="text-xs font-medium text-slate-500 font-mono">stocksense.app / dashboard</div>
            </div>

            <div className="flex bg-slate-950 text-left" style={{ height: '400px', overflow: 'hidden' }}>
              {/* Sidebar stub */}
              <div className="hidden md:flex flex-col w-52 bg-slate-900/70 border-r border-slate-800 p-4 gap-2 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-indigo-600/30 border border-indigo-500/30" />
                  <div className="h-3 w-20 bg-slate-700 rounded" />
                </div>
                {['Dashboard', 'Products', 'Receipts', 'Deliveries', 'Transfers', 'Adjustments', 'Move History'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i === 0 ? 'bg-indigo-600/20 border border-indigo-500/20' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    <div className={`h-2.5 rounded text-xs ${i === 0 ? 'text-indigo-300 font-semibold' : 'bg-slate-700 w-16'}`}>
                      {i === 0 ? <span className="text-xs text-indigo-300 font-medium">Dashboard</span> : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col gap-5 p-5 overflow-hidden">
                <div className="text-sm font-semibold text-slate-200">Dashboard</div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Products', value: '1,248', color: 'border-slate-700' },
                    { label: 'Low Stock', value: '14', color: 'border-amber-500/40', badge: 'amber' },
                    { label: 'Pending Receipts', value: '7', color: 'border-slate-700' },
                    { label: 'Internal Transfers', value: '3', color: 'border-slate-700' },
                  ].map((card, i) => (
                    <div key={i} className={`p-4 bg-slate-900 rounded-xl border ${card.color} relative overflow-hidden`}>
                      {card.badge && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/70" />}
                      <div className="text-xs text-slate-500 mb-1.5">{card.label}</div>
                      <div className={`text-2xl font-bold ${card.badge ? 'text-amber-400' : 'text-white'}`}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Fix-it panel */}
                <div className="flex-1 border border-amber-500/20 bg-amber-500/5 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-sm text-slate-100">Inventory Attention</span>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">1 Issue</span>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/60 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white text-sm">Steel Rods</h4>
                        <p className="text-xs text-amber-400 font-medium mt-0.5">Low Stock</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">17 <span className="text-sm font-normal text-slate-400">kg</span></div>
                        <div className="text-xs text-slate-500">Reorder level: 25 kg</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex gap-2">
                      <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md cursor-pointer hover:bg-indigo-500 transition-colors">View Issue</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE STRIP ── */}
        <div className="border-y border-slate-800/60 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2"><Database className="w-4 h-4 text-indigo-500" /> Centralized Inventory</div>
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-500" /> Multi-Warehouse</div>
              <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Real-Time Stock Visibility</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> AI-Assisted Operations</div>
            </div>
          </div>
        </div>

        {/* ── PROBLEM SECTION ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center" id="how-it-works">
          <h2 className="text-3xl font-bold text-white mb-5">Inventory gets complicated when your data is scattered.</h2>
          <p className="text-lg text-slate-400 mb-16 leading-relaxed">
            Manual registers, spreadsheets, disconnected records, and unclear stock movements make inventory harder to manage. StockSense brings those operations together.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700 text-slate-400 text-sm w-full md:w-64 space-y-3">
              {['Manual Registers', 'Excel Sheets', 'Scattered Tracking'].map((item) => (
                <div key={item} className="flex items-center gap-2 justify-center">
                  <X className="w-4 h-4 text-rose-500/60 shrink-0" /> {item}
                </div>
              ))}
            </div>

            <ArrowRight className="w-7 h-7 text-slate-700 rotate-90 md:rotate-0 shrink-0" />

            <div className="p-6 bg-indigo-600/10 rounded-2xl border border-indigo-500/30 text-white font-semibold w-full md:w-64 shadow-lg shadow-indigo-900/20 text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" /> StockSense
              </div>
              <div className="text-xs font-normal text-indigo-400">Centralized Inventory</div>
            </div>
          </div>
        </section>

        {/* ── CORE FEATURES ── */}
        <section className="py-24 border-t border-slate-800/60 bg-slate-900/30" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Everything you need to stay in control of stock.</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <Boxes />, title: 'Product Management', desc: 'Manage Products, SKUs, Categories, Units, and automated Reordering Rules.' },
                { icon: <Layers />, title: 'Multi-Warehouse', desc: 'Track inventory precisely across various Warehouses, Locations, and specific Racks.' },
                { icon: <ArrowDownToLine />, title: 'Receipts', desc: 'Manage incoming goods and automatically increase stock levels upon validation.' },
                { icon: <ArrowUpFromLine />, title: 'Delivery Orders', desc: 'Pick, pack, validate, and track all your outgoing inventory shipments.' },
                { icon: <MoveRight />, title: 'Internal Transfers', desc: 'Move stock between warehouses while keeping total company inventory accurate.' },
                { icon: <RefreshCw />, title: 'Inventory Adjustments', desc: 'Reconcile recorded inventory with your physical stock counts easily.' },
              ].map((f, i) => (
                <div key={i} className="p-6 bg-slate-900 rounded-2xl border border-slate-700/60 hover:border-slate-600 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-600/25 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INVENTORY FLOW & STOCK LEDGER ── */}
        <section className="py-24 border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

              <div>
                <h2 className="text-3xl font-bold text-white mb-5">One flow. Every movement accounted for.</h2>
                <p className="text-lg text-slate-400 mb-12">
                  StockSense translates real-world warehouse actions into a clean, permanent digital ledger.
                </p>

                <div className="space-y-5">
                  {[
                    { label: 'RECEIVE', title: 'Receipts', desc: 'Increase stock', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
                    { label: 'DELIVER', title: 'Deliveries', desc: 'Decrease stock', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' },
                    { label: 'MOVE', title: 'Transfers', desc: 'Change location', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
                    { label: 'ADJUST', title: 'Adjustments', desc: 'Reconcile counts', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
                  ].map((flow, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider border w-24 text-center shrink-0 ${flow.cls}`}>{flow.label}</div>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{flow.title}</div>
                        <div className="text-sm text-slate-500">{flow.desc}</div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                    <div className="px-3 py-1.5 rounded text-xs font-bold tracking-wider border w-24 text-center shrink-0 bg-indigo-600/20 text-indigo-300 border-indigo-500/30">LEDGER</div>
                    <div>
                      <div className="font-semibold text-slate-100 text-sm">Stock Ledger</div>
                      <div className="text-sm text-slate-500">Every validated movement is permanently recorded.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700/60 shadow-xl shadow-black/20">
                <h3 className="text-xl font-bold text-white mb-8">Know not only what you have — know <em className="not-italic text-indigo-400">why</em> you have it.</h3>

                <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 pb-8">
                  {[
                    { val: '+100 kg', color: 'bg-emerald-500', textColor: 'text-emerald-400', label: 'Receipt · PO-2049' },
                    { val: '-40 kg', color: 'bg-blue-500', textColor: 'text-blue-400', label: 'Internal Transfer → Warehouse B' },
                    { val: '-20 kg', color: 'bg-rose-500', textColor: 'text-rose-400', label: 'Delivery · SO-9912' },
                    { val: '-3 kg', color: 'bg-amber-500', textColor: 'text-amber-400', label: 'Adjustment · Damage Write-off' },
                  ].map((entry, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full ${entry.color} border-4 border-slate-900`} />
                      <div className="pl-6">
                        <div className={`font-mono font-semibold ${entry.textColor}`}>{entry.val}</div>
                        <div className="text-sm text-slate-500">{entry.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center mt-2">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Current Stock</div>
                    <div className="text-slate-200 font-semibold text-sm">Steel Rods</div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">37 <span className="text-sm font-normal text-slate-400">kg</span></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── AI FIX-IT MODE ── */}
        <section className="py-24 border-t border-slate-800/60 bg-slate-900/40" id="ai-intelligence">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Fix-It UI card */}
              <div className="order-2 lg:order-1 bg-slate-950 border border-slate-700/60 rounded-2xl p-6 md:p-8 font-mono text-sm shadow-2xl shadow-black/40">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-100 font-sans">Inventory Attention</span>
                </div>

                <div className="mb-5">
                  <div className="text-slate-200 font-sans">Steel Rods — <span className="text-amber-400 font-semibold">Low Stock</span></div>
                  <div className="text-slate-500 mt-2">17 kg available</div>
                  <div className="text-slate-600">Reorder level: 25 kg</div>
                </div>

                <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-200 mb-2 font-sans font-semibold text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Why?
                  </div>
                  <div className="text-slate-500 pl-5 space-y-1.5">
                    <div>Recent delivery: <span className="text-rose-400">-20 kg</span></div>
                    <div>Damage adjustment: <span className="text-amber-400">-3 kg</span></div>
                  </div>
                </div>

                <div className="mb-7 p-4 bg-indigo-950/60 rounded-xl border border-indigo-500/20">
                  <div className="text-indigo-300 mb-1 font-sans font-semibold text-xs">Suggested Fix</div>
                  <div className="text-slate-300 font-sans text-sm">Review incoming receipt and expedite PO-2055.</div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors font-sans font-medium text-sm">
                    View Evidence
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors font-sans text-sm shadow-lg shadow-indigo-600/20">
                    Review Fix
                  </button>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-5 block">AI Intelligence</span>
                <h2 className="text-3xl font-bold text-white mb-6">When something goes wrong, StockSense helps you fix it.</h2>
                <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                  Fix-It Mode identifies inventory issues, explains what caused them, shows the evidence, and helps you prepare a safe resolution — based on actual inventory data, not guesswork.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: 'Issue detected', desc: 'Low stock below reorder level' },
                    { icon: <HelpCircle className="w-4 h-4 text-indigo-400" />, label: 'Root cause traced', desc: 'Movement history surfaced' },
                    { icon: <FileSearch className="w-4 h-4 text-blue-400" />, label: 'Evidence shown', desc: 'Linked documents & quantities' },
                    { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, label: 'Safe action confirmed', desc: 'You approve before anything changes' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="mt-0.5">{step.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{step.label}</div>
                        <div className="text-sm text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-16 text-center">How StockSense Works</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Connect Your Inventory', desc: 'Set up warehouses, locations, and products.' },
                { step: '02', title: 'Track Every Movement', desc: 'Log receipts, deliveries, and internal transfers.' },
                { step: '03', title: 'Understand Issues', desc: 'AI flags anomalies and explains root causes.' },
                { step: '04', title: 'Take Action', desc: 'Resolve discrepancies safely and confidently.' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="text-6xl font-extrabold text-slate-800 mb-3 font-mono">{item.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO IT'S FOR ── */}
        <section className="py-24 border-t border-slate-800/60 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
              {[
                {
                  icon: <User className="w-5 h-5" />,
                  iconBg: 'bg-indigo-600/15 text-indigo-400 border-indigo-500/20',
                  title: 'Inventory Managers',
                  items: ['Monitor stock globally', 'Manage receipts & deliveries', 'Handle physical adjustments', 'Review AI alerts & anomalies'],
                },
                {
                  icon: <Boxes className="w-5 h-5" />,
                  iconBg: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20',
                  title: 'Warehouse Staff',
                  items: ['Pick and pack orders', 'Transfer stock internally', 'Shelve new receipts', 'Perform cycle counts'],
                },
              ].map((col, i) => (
                <div key={i} className="bg-slate-900 p-8 rounded-2xl border border-slate-700/60">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${col.iconBg}`}>{col.icon}</div>
                    {col.title}
                  </h3>
                  <ul className="space-y-3">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Feature detail strip */}
            <div className="border-t border-slate-800 pt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-700/60">
                <h4 className="font-semibold text-slate-100 text-sm mb-3">Multi-Warehouse Visibility</h4>
                <div className="text-xs font-mono text-slate-500 bg-slate-950 p-4 border border-slate-800 rounded-lg leading-6">
                  Main WH<br />
                  ├── Rack A<br />
                  └── Rack B<br />
                  <br />
                  WH 2<br />
                  └── Production
                </div>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-700/60">
                <h4 className="font-semibold text-slate-100 text-sm mb-3">Smart Inventory Alerts</h4>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-lg">LOW STOCK</span>
                  <span className="text-xs font-bold px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-lg">OUT OF STOCK</span>
                  <span className="text-xs font-bold px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-lg">PENDING RECEIPT</span>
                </div>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-700/60">
                <h4 className="font-semibold text-slate-100 text-sm mb-3">Smart Filters</h4>
                <div className="text-sm text-slate-500 bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  {['Search by SKU', 'Filter by Warehouse', 'Filter by Category', 'Filter by Status'].map((f) => (
                    <div key={f} className="border-b border-slate-800 pb-2 last:border-0 last:pb-0 text-xs">{f}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 border-t border-slate-800/60 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h2 className="text-4xl font-extrabold text-white mb-5">Take control of your inventory.</h2>
            <p className="text-lg text-slate-400 mb-10">
              Bring your stock operations into one clear, intelligent workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 hover:border-slate-600 transition-all shadow-sm">
                Explore StockSense
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/60 bg-slate-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Boxes className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">StockSense</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Smarter stock.<br />Better business.</p>
            </div>

            {[
              { heading: 'Product', links: ['Features', 'AI Intelligence', 'How It Works'] },
              { heading: 'Account', links: ['Log In', 'Get Started'], actions: [onLogin, onLogin] },
              { heading: 'Legal', links: ['Privacy', 'Terms'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-slate-200 mb-4 text-sm">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={link}>
                      {col.actions ? (
                        <button onClick={col.actions[j]} className="text-sm text-slate-500 hover:text-slate-200 transition-colors">{link}</button>
                      ) : (
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-200 transition-colors">{link}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 text-xs text-slate-600">
            © {new Date().getFullYear()} StockSense. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

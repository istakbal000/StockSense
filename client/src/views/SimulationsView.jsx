import React, { useState, useEffect } from 'react';
import { LineChart, Plus, Play, Calendar, AlertTriangle, ArrowRight, Activity, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';

export const SimulationsView = () => {
  const [scenarios, setScenarios] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [activeScenario, setActiveScenario] = useState(null);
  const [timeline, setTimeline] = useState(null);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [newEventModal, setNewEventModal] = useState(false);

  // Forms
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [evType, setEvType] = useState('DELIVERY');
  const [evProduct, setEvProduct] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evQty, setEvQty] = useState('');
  const [evSrc, setEvSrc] = useState('');
  const [evDest, setEvDest] = useState('');

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const [simRes, prodRes, locRes] = await Promise.all([
        api.getSimulations(),
        api.getProducts(),
        api.getLocations()
      ]);
      setScenarios(simRes.scenarios || []);
      setProducts(prodRes.products || []);
      setLocations(locRes.locations || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load scenarios' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSimulation({ name, description: desc });
      setCreateModal(false);
      setName(''); setDesc('');
      loadScenarios();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error creating scenario' });
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.addSimulationEvent(activeScenario.id, {
        eventType: evType,
        productId: evProduct,
        expectedDate: evDate,
        quantity: evQty,
        sourceLocationId: evSrc || null,
        destinationLocationId: evDest || null
      });
      setNewEventModal(false);
      setTimeline(null); // Reset timeline as it's dirty
      // reload active scenario
      const res = await api.runSimulation(activeScenario.id); // Hack to reload events quickly
      setActiveScenario({ ...activeScenario, events: res.timeline.map(t => t.event) });
      setFeedback({ type: 'success', message: 'Event added' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error adding event' });
    }
  };

  const handleRun = async (scenario) => {
    setActiveScenario(scenario);
    setTimeline(null);
    try {
      const res = await api.runSimulation(scenario.id);
      setTimeline(res.timeline);
      setActiveScenario({ ...scenario, events: res.timeline.map(t => t.event) });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error running simulation' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {activeScenario && (
            <button onClick={() => { setActiveScenario(null); setTimeline(null); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <LineChart className="w-6 h-6 text-purple-500" />
              {activeScenario ? activeScenario.name : 'What-If Simulator'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {activeScenario ? 'Scenario execution projection' : 'Project future inventory levels and spot deficits before they happen'}
            </p>
          </div>
        </div>
        {!activeScenario && (
          <button onClick={() => setCreateModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-600/20">
            <Plus className="w-4 h-4" /> New Scenario
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${
          feedback.type === 'error' ? 'bg-rose-950/50 text-rose-400 border-rose-900/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50'
        }`}>
          {feedback.message}
        </div>
      )}

      {!activeScenario ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : scenarios.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{s.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{s.description || 'No description'}</p>
                <div className="text-xs text-slate-500 mb-4 bg-slate-950 p-2 rounded-lg inline-block">
                  Events: {s._count.events}
                </div>
              </div>
              <button onClick={() => handleRun(s)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-500/30 text-white rounded-xl text-sm font-semibold border border-slate-700 transition-colors">
                <Play className="w-4 h-4" /> Open & Run
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button onClick={() => setNewEventModal(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-slate-700 flex gap-2 items-center">
              <Plus className="w-4 h-4" /> Add Event
            </button>
            <button onClick={() => handleRun(activeScenario)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-600/20 flex gap-2 items-center">
              <Activity className="w-4 h-4" /> Run Simulation
            </button>
          </div>

          {timeline && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-900/50 border-b border-slate-800">
                <h3 className="font-bold text-white">Projected Timeline</h3>
              </div>
              <div className="p-4 space-y-4">
                {timeline.length === 0 ? (
                  <p className="text-slate-500 text-sm">No events in this scenario. Add events and run.</p>
                ) : timeline.map((step, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${step.hasConflict ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-800/40 border-slate-700/50'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{new Date(step.event.date).toLocaleDateString()}</p>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          {step.event.type === 'RECEIPT' ? <span className="text-emerald-400">RECEIPT</span> : 
                           step.event.type === 'DELIVERY' ? <span className="text-blue-400">DELIVERY</span> : 
                           <span className="text-purple-400">TRANSFER</span>}
                           <span>{step.event.product.name}</span>
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          Qty: {step.event.qty} 
                          {step.event.src && ` | From: ${step.event.src}`}
                          {step.event.dest && ` | To: ${step.event.dest}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {Object.entries(step.projectedBalances).map(([locId, qty]) => {
                        const locName = locations.find(l => l.id === locId)?.name || 'Unknown Location';
                        return (
                          <div key={locId} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] uppercase text-slate-500 font-bold">{locName}</span>
                            <span className={`text-sm font-mono font-bold ${qty < 0 ? 'text-rose-500' : 'text-slate-200'}`}>
                              {qty}
                            </span>
                          </div>
                        );
                      })}
                      {step.hasConflict && (
                        <div className="flex items-center gap-1 text-rose-400 text-xs font-semibold bg-rose-950/50 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" /> {step.conflictMessage}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals for Create Scenario and Add Event */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="New Scenario">
        <form onSubmit={handleCreate} className="space-y-4">
          <input required placeholder="Scenario Name" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-sm text-white" />
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-sm text-white" />
          <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-xl">Create</button>
        </form>
      </Modal>

      <Modal isOpen={newEventModal} onClose={() => setNewEventModal(false)} title="Add Event">
        <form onSubmit={handleAddEvent} className="space-y-4 text-sm">
          <select required value={evType} onChange={e => setEvType(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-white">
            <option value="DELIVERY">Delivery (Out)</option>
            <option value="RECEIPT">Receipt (In)</option>
            <option value="TRANSFER">Transfer (Move)</option>
          </select>
          <select required value={evProduct} onChange={e => setEvProduct(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-white">
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input required type="date" value={evDate} onChange={e => setEvDate(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-white" />
          <input required type="number" min="1" placeholder="Quantity" value={evQty} onChange={e => setEvQty(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-white" />
          
          {evType !== 'RECEIPT' && (
            <select required value={evSrc} onChange={e => setEvSrc(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-white">
              <option value="">Source Location</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}
          {evType !== 'DELIVERY' && (
            <select required value={evDest} onChange={e => setEvDest(e.target.value)} className="w-full rounded-xl bg-slate-800 border-slate-700 px-3 py-2 text-white">
              <option value="">Destination Location</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}

          <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-xl">Add Event</button>
        </form>
      </Modal>

    </div>
  );
};

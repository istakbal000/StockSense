import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';

export const AnomaliesView = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const [resolveAnomaly, setResolveAnomaly] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAnomalies(filterStatus);
      setAnomalies(res.anomalies || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error loading anomalies' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes) return;
    try {
      await api.resolveAnomaly(resolveAnomaly.id, resolutionNotes);
      setFeedback({ type: 'success', message: 'Anomaly resolved' });
      setResolveAnomaly(null);
      setResolutionNotes('');
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error resolving anomaly' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            Inventory Anomalies
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review flagged suspicious inventory movements</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${
          feedback.type === 'error' ? 'bg-rose-950/50 text-rose-400 border-rose-900/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-800 border-slate-700 text-sm text-slate-200"
          >
            <option value="OPEN">Status: Open</option>
            <option value="RESOLVED">Status: Resolved</option>
            <option value="all">Status: All</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading anomalies...</div>
        ) : anomalies.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No anomalies found</p>
            <p className="text-xs text-slate-500 mt-1">Everything looks normal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {anomalies.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {a.severity === 'HIGH' ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : <AlertOctagon className="w-4 h-4 text-amber-500" />}
                        <span className="font-semibold text-white">{a.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300">{a.description}</p>
                      <div className="flex gap-2 text-xs text-slate-500 mt-1">
                        {a.product && <span>Product: {a.product.name}</span>}
                        {a.location && <span>Loc: {a.location.name}</span>}
                        {a.referenceDocument && <span>Ref: {a.referenceDocument}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'RESOLVED' ? (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-400">RESOLVED</span>
                      ) : (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-950 text-rose-400">OPEN</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.status === 'OPEN' && (
                        <button 
                          onClick={() => setResolveAnomaly(a)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!resolveAnomaly} onClose={() => { setResolveAnomaly(null); setResolutionNotes(''); }} title="Resolve Anomaly">
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Notes *</label>
            <textarea
              required
              rows={4}
              placeholder="Explain why this happened and how it was verified..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setResolveAnomaly(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md shadow-indigo-600/30">
              Mark as Resolved
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

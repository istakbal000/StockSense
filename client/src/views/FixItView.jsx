import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, AlertTriangle, FileText, CheckCircle2, ChevronRight, X, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';

export const FixItView = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [activeIssue, setActiveIssue] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [executing, setExecuting] = useState(false);
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await api.getFixItIssues();
      setIssues(res.issues || []);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to detect inventory issues.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleAnalyze = async (issue) => {
    setActiveIssue(issue);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await api.analyzeFixItIssue(issue);
      setAnalysis(res.analysis);
    } catch (err) {
      setFeedback({ type: 'error', message: 'AI failed to analyze the issue.' });
      setActiveIssue(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (!analysis?.recommendation || analysis.recommendation.actionType === 'NONE') return;
    setExecuting(true);
    try {
      const { actionType, payload } = analysis.recommendation;
      const res = await api.executeFixItAction(actionType, payload || { productId: activeIssue.productId });
      setFeedback({ type: 'success', message: res.message || 'Action executed successfully.' });
      setActiveIssue(null);
      setAnalysis(null);
      loadIssues();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to execute action.' });
    } finally {
      setExecuting(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatLog(prev => [...prev, { role: 'user', content: msg }]);

    try {
      // Direct call to /api/fixit/chat
      const token = localStorage.getItem('stocksense_token');
      const res = await fetch('/api/fixit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChatLog(prev => [...prev, { role: 'ai', content: data.text, recommendation: data.recommendation }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'error', content: 'Chat connection failed.' }]);
    }
  };

  const renderAnalysis = () => {
    if (analyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
          <p className="text-sm font-semibold text-purple-300">StockSense AI is analyzing the ledger...</p>
        </div>
      );
    }
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* WHY SECTION */}
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Why is this happening?
          </h4>
          <ul className="space-y-2 mb-4">
            {analysis.facts?.map((fact, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {fact}
              </li>
            ))}
          </ul>
          {analysis.calculations?.length > 0 && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-500 font-mono">CALCULATIONS</p>
              {analysis.calculations.map((calc, idx) => (
                <p key={idx} className="text-sm text-slate-300 font-mono mt-1">{calc}</p>
              ))}
            </div>
          )}
        </div>

        {/* EVIDENCE SECTION */}
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Evidence
          </h4>
          <ul className="space-y-2">
            {analysis.evidence?.map((ev, idx) => (
              <li key={idx} className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                {ev}
              </li>
            ))}
          </ul>
        </div>

        {/* FIX SUGGESTION SECTION */}
        <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Suggested Fix
          </h4>
          <p className="text-sm text-purple-200 mb-4">{analysis.recommendation?.description}</p>
          
          {analysis.requiresConfirmation && (
            <div className="bg-slate-950/50 p-3 rounded-lg border border-purple-900/50 mb-4">
              <p className="text-xs font-mono text-amber-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3" /> ACTION PREVIEW
              </p>
              <p className="text-sm text-slate-300">
                A Draft <strong className="text-white">{analysis.recommendation.actionType.replace('CREATE_', '').replace('_DRAFT', '')}</strong> will be prepared for your review. The database stock balance will NOT change until you validate the draft.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-purple-900/50">
            <button onClick={() => setActiveIssue(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800">
              Dismiss
            </button>
            {analysis.recommendation?.actionType !== 'NONE' && (
              <button 
                onClick={handleExecute} 
                disabled={executing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-600/30 disabled:opacity-50"
              >
                {executing ? 'Executing...' : 'Confirm & Execute'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            StockSense Fix-It Mode
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI-powered inventory exception resolution.</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${
          feedback.type === 'error' ? 'bg-rose-950/50 text-rose-400 border-rose-900/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ISSUES LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white">Detected Issues</h3>
              <span className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg text-xs font-bold border border-rose-500/20">
                {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
              </span>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Scanning inventory...</div>
            ) : issues.length === 0 ? (
              <div className="p-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">All clear</p>
                <p className="text-xs text-slate-500 mt-1">No operational exceptions detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {issues.map(issue => (
                  <div key={issue.id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {issue.type === 'OUT_OF_STOCK' ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{issue.type.replace(/_/g, ' ')}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{issue.productName}</h4>
                      <p className="text-sm text-slate-400 mt-1">{issue.message}</p>
                    </div>
                    <button 
                      onClick={() => handleAnalyze(issue)}
                      className="px-4 py-2 bg-slate-800 hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-500/30 text-white text-sm font-semibold rounded-xl border border-slate-700 transition-colors shrink-0"
                    >
                      Diagnose & Fix
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASK STOCKSENSE (CHAT) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[500px] flex flex-col shadow-xl shadow-black/20">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Ask StockSense
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
              {chatLog.length === 0 ? (
                <p className="text-center text-xs text-slate-500 mt-10">Ask a question about inventory, or request a transfer/receipt draft in plain English.</p>
              ) : (
                chatLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : msg.role === 'error' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900/80">
              <form onSubmit={handleChat} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Move 20 chairs to Rack 1"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                />
                <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYSIS MODAL */}
      <Modal isOpen={!!activeIssue} onClose={() => setActiveIssue(null)} title={activeIssue ? `Diagnosing: ${activeIssue.productName}` : 'Fix-It Analysis'} maxWidth="2xl">
        {renderAnalysis()}
      </Modal>

    </div>
  );
};

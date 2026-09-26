import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';

  if (normalized === 'done' || normalized === 'in stock' || normalized === 'picked' || normalized === 'packed') {
    styles = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
  } else if (normalized === 'ready') {
    styles = 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30';
    dotColor = 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]';
  } else if (normalized === 'waiting' || normalized === 'low stock' || normalized === 'pending') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
  } else if (normalized === 'canceled' || normalized === 'out of stock') {
    styles = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
    dotColor = 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]';
  } else if (normalized === 'draft') {
    styles = 'bg-slate-800/70 text-slate-300 border-slate-700/50';
    dotColor = 'bg-slate-400';
  } else if (normalized === 'receipt') {
    styles = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20';
    dotColor = 'bg-emerald-400';
  } else if (normalized === 'delivery') {
    styles = 'bg-blue-950/40 text-blue-300 border-blue-500/20';
    dotColor = 'bg-blue-400';
  } else if (normalized === 'internal_transfer' || normalized === 'internal') {
    styles = 'bg-indigo-950/40 text-indigo-300 border-indigo-500/20';
    dotColor = 'bg-indigo-400';
  } else if (normalized === 'adjustment') {
    styles = 'bg-purple-950/40 text-purple-300 border-purple-500/20';
    dotColor = 'bg-purple-400';
  } else if (normalized === 'initial_stock') {
    styles = 'bg-teal-950/40 text-teal-300 border-teal-500/20';
    dotColor = 'bg-teal-400';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm transition-all ${styles} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};

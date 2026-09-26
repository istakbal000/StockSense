import React from 'react';











export const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'indigo',
  trend,
  onClick
}) => {
  const variantStyles = {
    indigo: {
      border: 'hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'glow-indigo'
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'glow-emerald'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'glow-amber'
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'glow-rose'
    },
    blue: {
      border: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'glow-indigo'
    },
    purple: {
      border: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'glow-indigo'
    }
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`glass-card relative overflow-hidden rounded-2xl p-5 border border-slate-800 transition-all duration-300 hover:-translate-y-0.5 ${
      onClick ? 'cursor-pointer' : ''} ${
      variantStyles.border}`}>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-xl border p-3 ${variantStyles.iconBg}`}>
          {icon}
        </div>
      </div>
      {trend &&
      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>{trend}</span>
        </div>
      }
    </div>);

};
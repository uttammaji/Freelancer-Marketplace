import React from 'react';

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = ''
}) {
  return (
    <div className={`market-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color = 'primary', // 'primary', 'emerald', 'amber', 'rose', 'purple'
  subtitle
}) {
  const iconColors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconColors[color] || iconColors.primary}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>

        {change !== undefined && (
          <div
            className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
              isPositive
                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60'
                : isPositive === false
                ? 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/60'
                : 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : isPositive === false ? (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            ) : (
              <Minus className="w-3 h-3 mr-0.5" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

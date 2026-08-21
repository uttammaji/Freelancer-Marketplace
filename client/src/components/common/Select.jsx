import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          className={`w-full appearance-none bg-white dark:bg-slate-900 border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
            error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

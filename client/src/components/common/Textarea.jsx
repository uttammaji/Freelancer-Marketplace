import React from 'react';

export function Textarea({
  label,
  error,
  helperText,
  maxLength,
  value,
  className = '',
  rows = 4,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] text-slate-400 font-medium">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-y disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

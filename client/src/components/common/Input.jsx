import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  onIconRightClick,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
            Icon ? 'pl-10' : ''
          } ${IconRight ? 'pr-10' : ''} ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
          } ${className}`}
          {...props}
        />
        {IconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className={`absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ${
              !onIconRightClick ? 'pointer-events-none' : ''
            }`}
          >
            <IconRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search projects, skills, or talent...',
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
  autoFocus = false
}) {
  const sizes = {
    sm: 'py-2 pl-9 pr-8 text-xs',
    md: 'py-2.5 pl-10 pr-9 text-sm',
    lg: 'py-3.5 pl-12 pr-11 text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-3',
    md: 'w-4 h-4 left-3.5',
    lg: 'w-5 h-5 left-4'
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className={`absolute pointer-events-none text-slate-400 ${iconSizes[size] || iconSizes.md}`}>
        <Search className="w-full h-full" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-150 ${
          sizes[size] || sizes.md
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange(''))}
          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are currently no items matching your criteria.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl ${className}`}>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-slate-400 dark:text-slate-500 mb-4 ring-8 ring-slate-50/50 dark:ring-slate-800/30">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

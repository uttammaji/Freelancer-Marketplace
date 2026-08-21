import React from 'react';

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex gap-2 mb-5">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export function FreelancerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

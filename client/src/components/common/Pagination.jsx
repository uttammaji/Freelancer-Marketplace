import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 ${className}`}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50 text-slate-700 dark:text-slate-200"
        >
          Previous
        </button>
        <span className="text-xs text-slate-500 self-center">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50 text-slate-700 dark:text-slate-200"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
        </p>
        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-xl px-2.5 py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {getPageNumbers().map((page, idx) => (
            <button
              key={idx}
              disabled={page === '...'}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`relative inline-flex items-center px-3.5 py-2 text-xs font-semibold border ${
                page === currentPage
                  ? 'z-10 bg-primary-600 border-primary-600 text-white focus:z-20'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              } ${page === '...' ? 'cursor-default opacity-50' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-r-xl px-2.5 py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}

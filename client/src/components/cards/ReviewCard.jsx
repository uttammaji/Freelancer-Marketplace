import React from 'react';
import { Avatar } from '../common/Avatar';
import { Rating } from '../common/Rating';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function ReviewCard({ review }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={review.clientAvatar} alt={review.clientName} size="sm" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {review.clientName}
            </h4>
            {review.clientCompany && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {review.clientCompany}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <Rating value={review.rating} size="xs" showNumber={true} />
          <span className="text-[11px] text-slate-400 block mt-0.5">{review.date || formatDate(review.createdAt)}</span>
        </div>
      </div>

      {/* Project Title & Cost */}
      {review.projectTitle && (
        <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-850/50 rounded-lg">
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate mr-2">
            {review.projectTitle}
          </span>
          {review.cost && (
            <span className="font-bold text-slate-900 dark:text-white shrink-0">
              {formatCurrency(review.cost)}
            </span>
          )}
        </div>
      )}

      {/* Comment text */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
        "{review.comment}"
      </p>

      {/* 4 Category breakdowns if available */}
      {review.criteria && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 block">Communication</span>
            <span className="font-bold text-slate-900 dark:text-white">{review.criteria.communication || 5.0} ★</span>
          </div>
          <div>
            <span className="text-slate-400 block">Quality</span>
            <span className="font-bold text-slate-900 dark:text-white">{review.criteria.quality || 5.0} ★</span>
          </div>
          <div>
            <span className="text-slate-400 block">Professionalism</span>
            <span className="font-bold text-slate-900 dark:text-white">{review.criteria.professionalism || 5.0} ★</span>
          </div>
          <div>
            <span className="text-slate-400 block">Timeliness</span>
            <span className="font-bold text-slate-900 dark:text-white">{review.criteria.timeliness || 5.0} ★</span>
          </div>
        </div>
      )}
    </div>
  );
}

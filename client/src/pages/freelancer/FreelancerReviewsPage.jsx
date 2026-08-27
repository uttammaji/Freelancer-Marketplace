import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';

export function FreelancerReviewsPage() {
  const { currentUser } = useAuth();
  const { freelancers } = useMarketplace();

  const me = freelancers.find(f => f.userId === currentUser?.id || f.id === 'fl-1') || freelancers[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="warning" size="sm" className="mb-2">Client Reputation & Trust</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Client Reviews & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ratings received on completed contracts and milestones
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
          <Rating value={me.rating || 4.96} size="sm" showNumber={false} />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {me.rating} ★ ({me.reviewsCount || 52} Reviews)
          </span>
        </div>
      </div>

      {/* Criteria Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-xs text-slate-400 font-medium">Communication</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">5.0 ★</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-xs text-slate-400 font-medium">Quality of Code</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">4.96 ★</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-xs text-slate-400 font-medium">Professionalism</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">5.0 ★</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-xs text-slate-400 font-medium">Timeliness & Deadlines</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block">4.92 ★</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {me.reviews?.map((rev) => (
          <ReviewCard key={rev.id} review={rev} />
        ))}
      </div>
    </div>
  );
}

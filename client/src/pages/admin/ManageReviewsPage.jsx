import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Badge } from '../../components/common/Badge';
import { Star, ShieldAlert } from 'lucide-react';

export function ManageReviewsPage() {
  const { freelancers } = useMarketplace();

  const allReviews = freelancers.flatMap(f => f.reviews || []);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Quality & Trust Operations</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Review Moderation & Trust Scores
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit client ratings, flag spam/inappropriate feedback, and ensure review integrity
        </p>
      </div>

      <div className="space-y-4">
        {allReviews.map((rev) => (
          <ReviewCard key={rev.id} review={rev} />
        ))}
      </div>
    </div>
  );
}

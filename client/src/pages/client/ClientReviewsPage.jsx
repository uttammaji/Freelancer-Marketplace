import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { Star } from 'lucide-react';

export function ClientReviewsPage() {
  const { currentUser } = useAuth();
  const { freelancers } = useMarketplace();

  // Find all reviews written by or given to this client
  const clientReviews = [
    {
      id: 'rev-client-1',
      clientName: 'Rahul Sharma',
      clientCompany: 'Full Stack Engineer',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      projectTitle: 'Real-time AI Document Assistant Frontend',
      rating: 5.0,
      date: 'Aug 14, 2026',
      cost: 3800,
      comment: 'Sarah is an exemplary client to work with! Clear requirements, lightning-fast feedback on PRs, and instant escrow releases upon milestone completion.',
      criteria: { communication: 5.0, quality: 5.0, professionalism: 5.0, timeliness: 5.0 }
    },
    {
      id: 'rev-client-2',
      clientName: 'Elena Rostova',
      clientCompany: 'Lead UI/UX Designer',
      clientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      projectTitle: 'AI Analytics Platform Design System',
      rating: 5.0,
      date: 'Jul 10, 2026',
      cost: 3200,
      comment: 'Great vision and highly respectful of the design process. Looking forward to our next collaboration with Nexus Innovations!',
      criteria: { communication: 5.0, quality: 5.0, professionalism: 5.0, timeliness: 5.0 }
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="warning" size="sm" className="mb-2">Reputation & Feedback</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Client Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Feedback received from hired freelancers and specialists
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
          <Rating value={4.95} size="sm" showNumber={false} />
          <span className="text-sm font-bold text-slate-900 dark:text-white">4.95 ★ (16 Reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {clientReviews.map((rev) => (
          <ReviewCard key={rev.id} review={rev} />
        ))}
      </div>
    </div>
  );
}

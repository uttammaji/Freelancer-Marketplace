// client/src/pages/client/ClientReviewsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import { getMyReviews, getUserReviews, getReviewSummary } from '../../services/review.service';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader2, Star } from 'lucide-react';

export function ClientReviewsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = currentUser?.id || currentUser?._id;

  // Fetch reviews received by client (written by freelancers)
  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        getUserReviews(currentUserId),
        getReviewSummary(currentUserId)
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.reviews || []);
      }

      if (summaryRes.success) {
        setSummary(summaryRes.summary);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Load Failed', 'Could not load reviews.');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map backend review to card format
  const mapReviewToCard = (review) => ({
    id: review._id,
    clientName: review.reviewerId?.name || 'Freelancer',
    clientCompany: review.reviewerId?.role === 'freelancer' ? 'Freelancer' : 'Client',
    clientAvatar: review.reviewerId?.avatar || '',
    projectTitle: review.projectId?.title || 'Project',
    rating: review.rating,
    date: review.createdAt,
    comment: review.comment || '',
    criteria: {
      communication: review.communicationRating || review.communication || review.rating,
      quality: review.qualityRating || review.quality || review.rating,
      professionalism: review.professionalismRating || review.professionalism || review.rating,
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

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

        {summary && summary.totalReviews > 0 && (
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
            <Rating value={summary.averageRating} size="sm" showNumber={false} />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {summary.averageRating.toFixed(2)} ★ ({summary.totalReviews} Reviews)
            </span>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={mapReviewToCard(review)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Once you complete contracts, freelancers will leave reviews here."
        />
      )}
    </div>
  );
}

export default ClientReviewsPage;
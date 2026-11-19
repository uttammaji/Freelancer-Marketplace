// client/src/pages/freelancer/FreelancerReviewsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUserReviews, getMyReviews, getReviewSummary } from '../../services/review.service';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Tabs } from '../../components/common/Tabs';
import { Loader2, Star } from 'lucide-react';

export function FreelancerReviewsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [reviewsReceived, setReviewsReceived] = useState([]);
  const [reviewsGiven, setReviewsGiven] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    
    try {
      const [receivedRes, givenRes, summaryRes] = await Promise.all([
        getUserReviews(currentUserId),
        getMyReviews(),
        getReviewSummary(currentUserId)
      ]);

      if (receivedRes.success) {
        setReviewsReceived(receivedRes.reviews || []);
      }

      if (givenRes.success) {
        setReviewsGiven(givenRes.reviews || []);
      }

      if (summaryRes.success) {
        setSummary(summaryRes.summary);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Load Failed', 'Could not load reviews.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateCriteriaAverage = (reviews, field) => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => {
      return sum + (review[field] || review.rating);
    }, 0);
    return total / reviews.length;
  };

  const mapReceivedReview = (review) => ({
    id: review._id,
    clientName: review.reviewerId?.name || 'Client',
    clientCompany: review.reviewerId?.role === 'client' ? 'Client' : 'Freelancer',
    clientAvatar: review.reviewerId?.avatar || '',
    projectTitle: review.projectId?.title || 'Project',
    rating: review.rating,
    date: review.createdAt,
    comment: review.comment || '',
    criteria: {
      communication: review.communicationRating || review.rating,
      quality: review.qualityRating || review.rating,
      professionalism: review.professionalismRating || review.rating,
    }
  });

  const mapGivenReview = (review) => ({
    id: review._id,
    clientName: review.revieweeId?.name || 'Client',
    clientCompany: review.revieweeId?.role === 'client' ? 'Client' : 'Freelancer',
    clientAvatar: review.revieweeId?.avatar || '',
    projectTitle: review.projectId?.title || 'Project',
    rating: review.rating,
    date: review.createdAt,
    comment: review.comment || '',
    criteria: {
      communication: review.communicationRating || review.rating,
      quality: review.qualityRating || review.rating,
      professionalism: review.professionalismRating || review.rating,
    }
  });

  const tabs = [
    { id: 'received', label: `Received (${reviewsReceived.length})` },
    { id: 'given', label: `Given (${reviewsGiven.length})` },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  const activeReviews = activeTab === 'received' ? reviewsReceived : reviewsGiven;
  const mapFunction = activeTab === 'received' ? mapReceivedReview : mapGivenReview;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="warning" size="sm" className="mb-2">Client Reputation & Trust</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Reviews & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View reviews received and given
          </p>
        </div>

        {summary && summary.totalReviews > 0 && activeTab === 'received' && (
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
            <Rating value={summary.averageRating} size="sm" showNumber={false} />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {summary.averageRating.toFixed(2)} ★ ({summary.totalReviews} Reviews)
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {/* Criteria Overview (only for received) */}
      {activeTab === 'received' && reviewsReceived.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400">Communication</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {calculateCriteriaAverage(reviewsReceived, 'communicationRating').toFixed(1)} ★
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400">Quality</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {calculateCriteriaAverage(reviewsReceived, 'qualityRating').toFixed(1)} ★
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400">Professionalism</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {calculateCriteriaAverage(reviewsReceived, 'professionalismRating').toFixed(1)} ★
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400">Overall</span>
            <span className="text-xl font-black text-slate-900 dark:text-white block">
              {summary?.averageRating?.toFixed(1) || '0.0'} ★
            </span>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {activeReviews.length > 0 ? (
        <div className="space-y-4">
          {activeReviews.map((review) => (
            <ReviewCard key={review._id} review={mapFunction(review)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title={activeTab === 'received' ? 'No reviews received yet' : 'No reviews given yet'}
          description={activeTab === 'received' 
            ? 'Once you complete contracts, clients will leave reviews here.'
            : 'Reviews you give to clients will appear here.'}
        />
      )}
    </div>
  );
}

export default FreelancerReviewsPage;
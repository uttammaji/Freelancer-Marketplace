// client/src/pages/admin/ManageReviewsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUserReviews, deleteReview } from '../../services/review.service';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader2, Star, ShieldAlert, Trash2 } from 'lucide-react';

export function ManageReviewsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // For admin, we need to fetch reviews from all users
  // Since backend doesn't have "get all reviews" endpoint, we use getMyReviews + getUserReviews
  // For now, let's fetch from current user (admin) as placeholder
  // TODO: Add backend endpoint for admin to get all reviews
  
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Note: Backend needs an admin endpoint for all reviews
      // For now, we'll show empty state and explain
      setReviews([]);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Load Failed', 'Could not load reviews.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await deleteReview(reviewToDelete._id);
      
      if (response.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewToDelete._id));
        setReviewToDelete(null);
        toast.success('Review Deleted', 'Review has been removed.');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Delete Failed', error.response?.data?.message || 'Could not delete review.');
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      review.reviewerId?.name?.toLowerCase().includes(query) ||
      review.revieweeId?.name?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query) ||
      review.projectId?.title?.toLowerCase().includes(query)
    );
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
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Quality & Trust Operations</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Review Moderation & Trust Scores
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit client ratings, flag spam/inappropriate feedback, and ensure review integrity
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search reviews by user or content..."
          size="md"
        />
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="relative group">
              <ReviewCard
                review={{
                  id: review._id,
                  clientName: review.reviewerId?.name || 'User',
                  clientAvatar: review.reviewerId?.avatar || '',
                  projectTitle: review.projectId?.title || 'Project',
                  rating: review.rating,
                  date: review.createdAt,
                  comment: review.comment || '',
                }}
              />
              
              {/* Delete button */}
              <button
                onClick={() => setReviewToDelete(review)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No reviews to moderate"
          description="Reviews will appear here for moderation when the admin endpoint is implemented."
        />
      )}

      {/* Delete Confirmation */}
      {reviewToDelete && (
        <ConfirmDialog
          isOpen={!!reviewToDelete}
          onClose={() => setReviewToDelete(null)}
          onConfirm={handleDeleteReview}
          title="Delete Review?"
          description={`Are you sure you want to delete this review by ${reviewToDelete.reviewerId?.name || 'User'}? This action cannot be undone.`}
          confirmLabel="Delete Review"
          variant="danger"
        />
      )}
    </div>
  );
}

export default ManageReviewsPage;
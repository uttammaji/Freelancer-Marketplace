// client/src/components/project/WriteReviewModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Rating } from '../common/Rating';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createReview } from '../../services/review.service';
import { Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export function WriteReviewModal({ isOpen, onClose, contract, onSubmit }) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [overallRating, setOverallRating] = useState(5);
  const [criteria, setCriteria] = useState({
    communication: 5,
    quality: 5,
    professionalism: 5,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract) return null;

  // Determine reviewee (who gets reviewed)
  const getRevieweeId = () => {
    if (!contract) return null;
    
    // If current user is client, review freelancer
    if (currentUser?.role === 'client') {
      return contract.freelancerId?._id || contract.freelancerId;
    }
    
    // If current user is freelancer, review client
    if (currentUser?.role === 'freelancer') {
      return contract.clientId?._id || contract.clientId;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() || comment.length < 10) {
      toast.warning('Review Comment Required', 'Please write a brief feedback comment (at least 10 characters).');
      return;
    }

    const revieweeId = getRevieweeId();
    const contractId = contract.id || contract._id;

    if (!revieweeId) {
      toast.error('Error', 'Could not determine who to review.');
      return;
    }

    if (!contractId) {
      toast.error('Error', 'Contract information is missing.');
      return;
    }

    // If onSubmit provided, parent handles API
    if (onSubmit) {
      setIsSubmitting(true);
      await onSubmit({
        contractId,
        revieweeId,
        rating: overallRating,
        communication: criteria.communication,
        quality: criteria.quality,
        professionalism: criteria.professionalism,
        comment: comment.trim(),
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReview({
        contractId,
        revieweeId,
        rating: Number(overallRating),
        communication: Number(criteria.communication),
        quality: Number(criteria.quality),
        professionalism: Number(criteria.professionalism),
        comment: comment.trim(),
      });

      if (response.success) {
        // Celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.log('Confetti unavailable');
        }

        toast.success('Review Published!', 'Your review has been added.');
        setComment('');
        setOverallRating(5);
        setCriteria({ communication: 5, quality: 5, professionalism: 5 });
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Submit Failed', error.response?.data?.message || 'Could not submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillTemplate = () => {
    setComment('Exceptional work from start to finish! Delivered ahead of schedule with spotless attention to detail, proactive communication, and high-performance code. Would hire again in a heartbeat!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave a Review & Rating"
      subtitle={contract.projectTitle ? `Project: ${contract.projectTitle}` : 'Share your experience'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overall Rating</span>
          <Rating
            value={overallRating}
            size="lg"
            interactive={true}
            onChange={(val) => setOverallRating(val)}
            showNumber={false}
          />
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
            {overallRating}.0 / 5.0
          </span>
        </div>

        {/* 3 Detailed Criteria (matches backend) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Communication</span>
            <Rating
              value={criteria.communication}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, communication: v }))}
              showNumber={false}
            />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Quality</span>
            <Rating
              value={criteria.quality}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, quality: v }))}
              showNumber={false}
            />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Professionalism</span>
            <Rating
              value={criteria.professionalism}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, professionalism: v }))}
              showNumber={false}
            />
          </div>
        </div>

        {/* Written Review */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Written Feedback
            </label>
            <button
              type="button"
              onClick={handleFillTemplate}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-fill
            </button>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working together..."
            rows={4}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Star} isLoading={isSubmitting}>
            Publish Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default WriteReviewModal;
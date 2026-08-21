import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Rating } from '../common/Rating';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export function WriteReviewModal({ isOpen, onClose, contract }) {
  const { currentUser } = useAuth();
  const { addReview } = useMarketplace();
  const toast = useToast();

  const [overallRating, setOverallRating] = useState(5);
  const [criteria, setCriteria] = useState({
    communication: 5,
    quality: 5,
    professionalism: 5,
    timeliness: 5
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || comment.length < 10) {
      toast.warning('Review Comment Required', 'Please write a brief feedback comment (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addReview({
        id: 'rev-' + Date.now(),
        freelancerId: contract.freelancerId,
        freelancerUserId: contract.freelancerUserId,
        clientName: currentUser?.name || contract.clientName,
        clientCompany: currentUser?.company || contract.clientCompany,
        clientAvatar: currentUser?.avatar || contract.clientAvatar,
        projectTitle: contract.projectTitle,
        rating: Number(overallRating),
        cost: contract.totalBudget,
        date: 'Today',
        createdAt: new Date().toISOString(),
        comment: comment,
        criteria: {
          communication: criteria.communication,
          quality: criteria.quality,
          professionalism: criteria.professionalism,
          timeliness: criteria.timeliness
        }
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }

      setIsSubmitting(false);
      toast.success('Feedback Published!', 'Your review has been added to the public profile.');
      onClose();
    }, 600);
  };

  const handleFillTemplate = () => {
    setComment('Exceptional work from start to finish! Delivered ahead of schedule with spotless attention to detail, proactive communication, and high-performance code. Would hire again in a heartbeat!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave a Review & Rating"
      subtitle={`Project: ${contract.projectTitle}`}
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
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{overallRating}.0 / 5.0</span>
        </div>

        {/* 4 Detailed Criteria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Communication</span>
            <Rating
              value={criteria.communication}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, communication: v }))}
              showNumber={false}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Quality of Work</span>
            <Rating
              value={criteria.quality}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, quality: v }))}
              showNumber={false}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Professionalism</span>
            <Rating
              value={criteria.professionalism}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, professionalism: v }))}
              showNumber={false}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Timeliness</span>
            <Rating
              value={criteria.timeliness}
              size="xs"
              interactive={true}
              onChange={(v) => setCriteria(prev => ({ ...prev, timeliness: v }))}
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
              <Sparkles className="w-3.5 h-3.5" /> Auto-fill feedback
            </button>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working together, their strengths, and why you would recommend them..."
            rows={4}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
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

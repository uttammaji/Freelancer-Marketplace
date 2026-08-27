import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, Send } from 'lucide-react';

export function RequestRevisionModal({ isOpen, onClose, contract, milestone }) {
  const { requestMilestoneRevision } = useMarketplace();
  const toast = useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract || !milestone) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.warning('Feedback Required', 'Please specify the exact changes or fixes needed.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      requestMilestoneRevision(contract.id, milestone.id, feedback);
      setIsSubmitting(false);
      toast.info('Revision Requested', 'Your feedback was sent to the freelancer.');
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Changes / Revision"
      subtitle={`Milestone: ${milestone.title}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Be clear and specific with your requested modifications so the freelancer can address them quickly.
          </span>
        </div>

        <Textarea
          label="Revision Feedback & Requirements"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Please update the button hover states on mobile and fix the token count chart axis formatting on tablet view..."
          rows={5}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Send} isLoading={isSubmitting}>
            Send Revision Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

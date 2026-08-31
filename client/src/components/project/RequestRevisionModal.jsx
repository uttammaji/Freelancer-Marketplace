// client/src/components/project/RequestRevisionModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requestRevision } from '../../services/delivery.service';
import { AlertCircle, Send } from 'lucide-react';

export function RequestRevisionModal({ isOpen, onClose, contract, milestone, delivery, onConfirm }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support both old (milestone) and new (delivery) props
  const target = delivery || milestone;
  const contractId = contract?.id || contract?._id;
  const deliveryId = delivery?._id || milestone?.id;

  if (!target) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.warning('Feedback Required', 'Please specify the exact changes or fixes needed.');
      return;
    }

    // If onConfirm provided, use it (parent handles API)
    if (onConfirm) {
      setIsSubmitting(true);
      await onConfirm(feedback.trim());
      setIsSubmitting(false);
      return;
    }

    // Otherwise call API directly
    if (!deliveryId) {
      toast.error('Error', 'Delivery information is missing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestRevision(deliveryId, {
        feedback: feedback.trim()
      });

      if (response.success) {
        toast.success('Revision Requested', 'Your feedback was sent to the freelancer.');
        setFeedback('');
        onClose();
      }
    } catch (error) {
      console.error('Failed to request revision:', error);
      toast.error('Request Failed', error.response?.data?.message || 'Could not request revision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Changes / Revision"
      subtitle={target.title ? `Delivery: ${target.title}` : 'Request modifications'}
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
          placeholder="e.g. Please update the button hover states on mobile and fix the chart axis formatting on tablet view..."
          rows={5}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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

export default RequestRevisionModal;
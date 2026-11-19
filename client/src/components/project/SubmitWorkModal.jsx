// client/src/components/project/SubmitWorkModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createDelivery, updateDelivery } from '../../services/delivery.service';
import { Upload, Link as LinkIcon, GitBranch, Send } from 'lucide-react';

export function SubmitWorkModal({ isOpen, onClose, contract, milestone, delivery, onSubmit, isRevision = false }) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState(delivery?.title || milestone?.title || '');
  const [message, setMessage] = useState(delivery?.message || '');
  const [liveDemoUrl, setLiveDemoUrl] = useState(delivery?.liveUrl || '');
  const [githubUrl, setGithubUrl] = useState(delivery?.githubUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract && !delivery) return null;

  const contractId = contract?.id || contract?._id || delivery?.contractId;
  const deliveryId = delivery?._id || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.warning('Title Required', 'Please provide a title for your delivery.');
      return;
    }

    if (!message.trim()) {
      toast.warning('Message Required', 'Please describe your completed deliverables.');
      return;
    }

    // If onSubmit provided, parent handles API
    if (onSubmit) {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: message.trim(),
        liveDemoUrl: liveDemoUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        attachments: [],
      });
      setIsSubmitting(false);
      return;
    }

    // Otherwise call API directly
    if (!contractId) {
      toast.error('Error', 'Contract information is missing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        contractId,
        title: title.trim(),
        description: message.trim(),
        liveDemoUrl: liveDemoUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        attachments: [],
      };

      let response;
      
      if (isRevision && deliveryId) {
        // Update existing delivery (resubmit after revision)
        response = await updateDelivery(deliveryId, data);
        if (response.success) {
          toast.success('Work Resubmitted!', 'Your updated work has been sent to the client.');
        }
      } else {
        // Create new delivery
        response = await createDelivery(data);
        if (response.success) {
          toast.success('Work Submitted!', 'Your deliverables have been sent to the client for approval.');
        }
      }

      // Reset form
      setTitle('');
      setMessage('');
      setLiveDemoUrl('');
      setGithubUrl('');
      onClose();
    } catch (error) {
      console.error('Failed to submit work:', error);
      toast.error('Submit Failed', error.response?.data?.message || 'Could not submit work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fill demo
  const handleFillDemo = () => {
    setTitle('Completed Deliverables');
    setMessage('All milestone deliverables have been engineered, tested across mobile/desktop, and deployed to the staging preview environment. Test credentials and architecture documentation are attached.');
    setLiveDemoUrl('https://staging.example.com');
    setGithubUrl('https://github.com/example/project');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRevision ? 'Resubmit Work' : 'Submit Work'}
      subtitle={title ? `Delivery: ${title}` : contract?.projectTitle || 'Submit your completed work'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Provide completed deliverable links & notes</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Auto-fill demo
          </button>
        </div>

        <Input
          label="Delivery Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Authentication Module Complete"
          required
        />

        <Textarea
          label="Delivery Message & Notes"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what was completed, testing instructions, and deployment details..."
          rows={4}
          required
        />

        <Input
          label="Live Demo / Prototype URL (Optional)"
          type="url"
          value={liveDemoUrl}
          onChange={(e) => setLiveDemoUrl(e.target.value)}
          icon={LinkIcon}
          placeholder="https://staging.app.com"
        />

        <Input
          label="GitHub / Repository URL (Optional)"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          icon={GitBranch}
          placeholder="https://github.com/org/repo"
        />

        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-850/50">
          <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            File uploads coming soon
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">You can add links above for now</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Send} isLoading={isSubmitting}>
            {isRevision ? 'Resubmit Work' : 'Submit Work'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SubmitWorkModal;
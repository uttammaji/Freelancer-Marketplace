// client/src/components/project/ProposalModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { submitProposal } from '../../services/proposal.service';
import { DollarSign, Clock, Send, Sparkles } from 'lucide-react';

export function ProposalModal({ isOpen, onClose, project }) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [bidAmount, setBidAmount] = useState(project?.budget || project?.budgetMin || 1000);
  const [deliveryDays, setDeliveryDays] = useState(21);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project) return null;

  // Calculate platform fee and take home
  const platformFee = Math.round(bidAmount * 0.05);
  const takeHome = bidAmount - platformFee;

  // Handle proposal submission
  const handleApply = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!coverLetter.trim() || coverLetter.length < 20) {
      toast.warning('Cover Letter Required', 'Please write at least 20 characters explaining your approach.');
      return;
    }

    if (bidAmount <= 0) {
      toast.warning('Invalid Bid', 'Please enter a valid bid amount.');
      return;
    }

    if (deliveryDays < 1) {
      toast.warning('Invalid Timeline', 'Delivery days must be at least 1 day.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitProposal({
        projectId: project.id || project._id,
        coverLetter: coverLetter.trim(),
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
        attachments: [],
      });

      if (response.success) {
        toast.success('Proposal Submitted!', `Your proposal of ${formatCurrency(bidAmount)} has been sent.`);
        setCoverLetter('');
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      toast.error('Submit Failed', error.response?.data?.message || 'Could not submit proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fill cover letter template
  const handleFillTemplate = () => {
    const projectTitle = project.title || 'your project';
    const skills = project.skills?.slice(0, 3).join(', ') || 'the required technologies';
    
    setCoverLetter(
      `Hi,\n\nI reviewed your project brief for "${projectTitle}" and I have extensive experience building scalable solutions with ${skills}.\n\nMy approach:\n1. Technical scoping and milestones breakdown within 48 hours.\n2. Iterative development with weekly preview deployments and automated test coverage.\n3. Clean, thoroughly documented codebase with seamless handoff.\n\nI am available to start immediately and dedicate 35+ hours/week to ensure timely delivery.\n\nLooking forward to speaking with you!`
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit a Proposal"
      subtitle={`Project: ${project.title || 'Project'}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleApply} className="space-y-5">
        {/* Project Budget summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Client's Budget</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(project.budget || project.budgetMin || 0)}
              {project.budgetMax && project.budgetMax > (project.budget || 0) && (
                <> - {formatCurrency(project.budgetMax)}</>
              )}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Budget Type</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {project.budgetType || 'fixed'}
            </span>
          </div>
        </div>

        {/* Pricing Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Bid Amount ($ USD)"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            icon={DollarSign}
            required
            helperText={`You receive: ${formatCurrency(takeHome)} (after 5% fee of ${formatCurrency(platformFee)})`}
          />

          <Input
            label="Delivery Days"
            type="number"
            value={deliveryDays}
            onChange={(e) => setDeliveryDays(Number(e.target.value))}
            icon={Clock}
            placeholder="e.g. 21"
            required
            min="1"
          />
        </div>

        {/* Cover Letter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Cover Letter
            </label>
            <button
              type="button"
              onClick={handleFillTemplate}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-fill template
            </button>
          </div>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Explain why you are the best fit for this project, your relevant experience, and your proposed approach..."
            rows={6}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Send} isLoading={isSubmitting}>
            Submit Proposal
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProposalModal;
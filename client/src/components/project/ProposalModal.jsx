import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { DollarSign, Clock, Send, Sparkles } from 'lucide-react';

export function ProposalModal({ isOpen, onClose, project }) {
  const { currentUser } = useAuth();
  const { submitProposal } = useMarketplace();
  const toast = useToast();

  const [bidAmount, setBidAmount] = useState(project?.budget || 3000);
  const [deliveryTime, setDeliveryTime] = useState('21 days');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project) return null;

  const platformFee = Math.round(bidAmount * 0.05);
  const takeHome = bidAmount - platformFee;

  const handleApply = (e) => {
    e.preventDefault();
    if (!coverLetter.trim() || coverLetter.length < 30) {
      toast.warning('Cover Letter Required', 'Please write at least 30 characters explaining your approach.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitProposal({
        projectId: project.id,
        freelancerId: 'fl-1',
        freelancerUserId: currentUser?.id || 'usr-freelancer-1',
        freelancerName: currentUser?.name || 'Rahul Sharma',
        freelancerTitle: currentUser?.title || 'Senior Full Stack Engineer',
        freelancerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        freelancerRating: 4.96,
        freelancerReviewsCount: 52,
        freelancerSuccessScore: 99,
        freelancerLocation: currentUser?.location || 'Bengaluru, India',
        bidAmount: Number(bidAmount),
        deliveryTime: deliveryTime,
        coverLetter: coverLetter,
        attachments: []
      });

      setIsSubmitting(false);
      toast.success('Proposal Submitted!', `Your proposal of ${formatCurrency(bidAmount)} has been sent to ${project.clientName}.`);
      onClose();
    }, 600);
  };

  const handleFillTemplate = () => {
    setCoverLetter(
      `Hi ${project.clientName},\n\nI reviewed your project brief for "${project.title}" and I have extensive experience building scalable solutions with ${project.skills?.slice(0, 3).join(', ')}.\n\nMy approach:\n1. Technical scoping and milestones breakdown within 48 hours.\n2. Iterative development with weekly preview deployments and automated test coverage.\n3. Clean, thoroughly documented codebase with seamless handoff.\n\nI am available to start immediately and dedicate 35+ hours/week to ensure timely delivery.\n\nLooking forward to speaking with you!`
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit a Proposal"
      subtitle={`Project: ${project.title}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleApply} className="space-y-5">
        {/* Project Budget summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Client's Budget</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(project.budget)} ({project.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'})
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Estimated Timeline</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {project.estimatedDuration || '1 to 3 months'}
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
            helperText={`You will receive: ${formatCurrency(takeHome)} (after 5% platform fee of ${formatCurrency(platformFee)})`}
          />

          <Input
            label="Estimated Delivery Time"
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            icon={Clock}
            placeholder="e.g. 21 days or 4 weeks"
            required
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
              <Sparkles className="w-3.5 h-3.5" /> Auto-fill tailored proposal
            </button>
          </div>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Explain why you are the best fit for this project, your relevant experience, and your proposed architecture..."
            rows={6}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
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

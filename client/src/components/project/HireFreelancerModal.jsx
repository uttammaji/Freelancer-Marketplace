import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export function HireFreelancerModal({ isOpen, onClose, proposal, project, freelancer }) {
  const { currentUser } = useAuth();
  const { hireFreelancerAndCreateContract } = useMarketplace();
  const toast = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('card_primary');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!proposal && !freelancer) return null;

  const targetFreelancer = freelancer || {
    id: proposal.freelancerId,
    name: proposal.freelancerName,
    avatar: proposal.freelancerAvatar,
    title: proposal.freelancerTitle,
    hourlyRate: 65
  };

  const targetProject = project || {
    id: proposal?.projectId || 'proj-custom',
    title: 'Custom Contract Project',
    budget: proposal?.bidAmount || 3000
  };

  const contractAmount = proposal?.bidAmount || targetProject.budget || 2500;
  const platformFee = Math.round(contractAmount * 0.05);

  const handleHire = (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      toast.warning('Agreement Required', 'Please accept the Escrow & Service Terms.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const contract = hireFreelancerAndCreateContract({
        project: targetProject,
        proposal: proposal || { id: 'prop-direct-' + Date.now(), bidAmount: contractAmount },
        freelancer: targetFreelancer,
        client: currentUser || {
          id: 'usr-client-1',
          name: 'Sarah Connor',
          company: 'Nexus Innovations',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
        }
      });

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }

      setIsProcessing(false);
      toast.success('Freelancer Hired! 🎉', 'Escrow funded and contract workspace activated.');
      onClose();
      navigate(`/dashboard/client/contracts/${contract.id}`);
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hire Freelancer & Fund Escrow"
      subtitle="Your payment will be safely held in SkillHire Escrow until you approve completed work."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleHire} className="space-y-5">
        {/* Freelancer snippet */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <Avatar src={targetFreelancer.avatar} alt={targetFreelancer.name} size="md" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {targetFreelancer.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {targetFreelancer.title}
            </p>
          </div>
          <Badge variant="primary" size="sm">
            {formatCurrency(contractAmount)}
          </Badge>
        </div>

        {/* Financial Escrow Breakdown */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Milestone Project Budget</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(contractAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Escrow Protection & Processing Fee (Client)</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">$0.00 (Free)</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
            <span>Total Escrow Deposit Today</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(contractAmount)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-primary-500/40 bg-primary-50/20 dark:bg-primary-950/20 cursor-pointer">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Visa ending in 4242</span>
                  <span className="text-[11px] text-slate-400">Expires 09/28 • Default</span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'card_primary'}
                onChange={() => setPaymentMethod('card_primary')}
                className="text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>100% Escrow Protection:</strong> Funds remain securely locked in SkillHire Escrow. You only release payment when work is delivered and you are 100% satisfied.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5"
          />
          <span>I agree to the SkillHire Service Contract Terms, Escrow Instructions, and Dispute Resolution Policy.</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Lock} isLoading={isProcessing}>
            Deposit Escrow & Start Contract ({formatCurrency(contractAmount)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}

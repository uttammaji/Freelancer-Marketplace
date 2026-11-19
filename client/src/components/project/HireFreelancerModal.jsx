// client/src/components/project/HireFreelancerModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createContract } from '../../services/contract.service';
import { acceptProposal } from '../../services/proposal.service';
import { createPaymentOrder, verifyPayment } from '../../services/payment.service';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export function HireFreelancerModal({ isOpen, onClose, proposal, project, freelancer, onHireConfirmed }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!proposal && !freelancer) return null;

  // Target freelancer info
  const targetFreelancer = freelancer || {
    id: proposal.freelancerId?._id || proposal.freelancerId,
    name: proposal.freelancerName || proposal.freelancerId?.name || 'Freelancer',
    avatar: proposal.freelancerAvatar || proposal.freelancerId?.avatar || '',
    title: proposal.freelancerTitle || 'Professional Freelancer',
  };

  // Target project info
  const targetProject = project || {
    id: proposal?.projectId || proposal?.projectId?._id,
    title: proposal?.projectTitle || 'Project',
  };

  const contractAmount = proposal?.bidAmount || targetProject.budget || 0;
  const proposalId = proposal?.id || proposal?._id;

  // Handle Razorpay checkout
  const openRazorpayCheckout = (orderData, contract) => {
    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'SkillHire',
      description: `Payment for: ${targetProject.title || 'Project'}`,
      order_id: orderData.order.id,
      handler: async (response) => {
        try {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: orderData.payment._id,
          });

          if (verifyRes.success) {
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch (e) {
              console.log('Confetti unavailable');
            }

            toast.success('Payment Successful!', 'Contract activated.');
            
            if (onHireConfirmed) {
              onHireConfirmed(proposalId);
            }
            
            onClose();
            navigate(`/dashboard/client/contracts/${contract._id}`);
          }
        } catch (error) {
          console.error('Verification failed:', error);
          toast.error('Verification Failed', 'Payment could not be verified. Contact support.');
        }
      },
      prefill: {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        contact: currentUser?.phone || '',
      },
      notes: {
        contractId: contract._id,
        projectId: targetProject.id,
      },
      theme: {
        color: '#4F46E5',
      },
      modal: {
        ondismiss: () => {
          toast.info('Payment Cancelled', 'You can retry payment anytime.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Handle hire with payment
  const handleHire = async (e) => {
    e.preventDefault();
    
    if (!agreedTerms) {
      toast.warning('Agreement Required', 'Please accept the Escrow & Service Terms.');
      return;
    }

    if (!targetProject?.id) {
      toast.error('Error', 'Project information is missing.');
      return;
    }

    if (!proposalId) {
      toast.error('Error', 'Proposal information is missing.');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Razorpay Not Loaded', 'Payment gateway is not available. Please refresh the page.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Accept proposal ONLY if not already accepted
      if (proposal?.status !== 'accepted') {
        try {
          const acceptResponse = await acceptProposal(proposalId);
          if (!acceptResponse.success) {
            throw new Error('Failed to accept proposal');
          }
        } catch (acceptError) {
          // If error is "cannot be accepted" it means already accepted - continue
          const errorMessage = acceptError.response?.data?.message || '';
          if (!errorMessage.includes('cannot be accepted')) {
            throw acceptError;
          }
        }
      }

      // Step 2: Create contract (backend returns existing if already exists)
      const contractResponse = await createContract({
        projectId: targetProject.id,
        proposalId: proposalId,
      });

      if (!contractResponse.success) {
        throw new Error(contractResponse.message || 'Failed to create contract');
      }

      const contract = contractResponse.contract;

      // Step 3: Check if contract needs payment
      if (contract.status === 'active') {
        // Already active - no payment needed
        toast.info('Contract Active', 'This contract is already active.');
        onClose();
        navigate(`/dashboard/client/contracts/${contract._id}`);
        return;
      }

      // Step 4: Create Razorpay order
      const orderResponse = await createPaymentOrder(contract._id);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      // Step 5: Open Razorpay checkout
      openRazorpayCheckout(orderResponse, contract);

    } catch (error) {
      console.error('Failed to hire freelancer:', error);
      toast.error('Hire Failed', error.response?.data?.message || error.message || 'Could not create contract.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hire Freelancer & Fund Escrow"
      subtitle="Your payment will be securely processed via Razorpay."
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
              {targetFreelancer.title || 'Professional Freelancer'}
            </p>
          </div>
          <Badge variant="primary" size="sm">
            {formatCurrency(contractAmount)}
          </Badge>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Project Budget</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(contractAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Platform Fee (5%)</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(Math.round(contractAmount * 0.05))}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Freelancer Receives</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(contractAmount - Math.round(contractAmount * 0.05))}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
            <span>Total Payment</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(contractAmount)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Razorpay Secure Payment</span>
            <span className="text-[11px] text-slate-400">UPI, Cards, NetBanking, Wallets</span>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>100% Escrow Protection:</strong> Funds remain securely locked. You only release payment when work is delivered and you are satisfied.
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
          <span>I agree to the Service Contract Terms, Escrow Instructions, and Dispute Resolution Policy.</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            icon={Lock} 
            isLoading={isProcessing}
          >
            Pay & Start Contract ({formatCurrency(contractAmount)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default HireFreelancerModal;
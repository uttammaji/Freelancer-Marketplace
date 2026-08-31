// client/src/pages/client/ClientContractWorkspacePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getContractById } from '../../services/contract.service';
import { 
  getContractDeliveries, 
  acceptDelivery, 
  requestRevision 
} from '../../services/delivery.service';
import { getMyReviews } from '../../services/review.service';
import { RequestRevisionModal } from '../../components/project/RequestRevisionModal';
import { WriteReviewModal } from '../../components/project/WriteReviewModal';
import { ProjectProgress } from '../../components/dashboard/ProjectProgress';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  FileText,
  MessageSquare,
  Star,
  Check,
  RotateCcw,
  Loader2,
  IndianRupee,
  CheckCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ClientContractWorkspacePage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [contract, setContract] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRevisionDelivery, setActiveRevisionDelivery] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isProcessingRelease, setIsProcessingRelease] = useState(false);

  // Check if already reviewed
  const hasReviewed = myReviews.some(r => r.contractId?._id === id || r.contractId === id);

  // Fetch contract and deliveries
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [contractRes, deliveriesRes, reviewsRes] = await Promise.all([
        getContractById(id),
        getContractDeliveries(id),
        getMyReviews(),
      ]);

      if (contractRes.success) {
        setContract(contractRes.contract);
      }

      if (deliveriesRes.success) {
        setDeliveries(deliveriesRes.deliveries || []);
      }

      if (reviewsRes.success) {
        setMyReviews(reviewsRes.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch workspace:', error);
      toast.error('Load Failed', 'Could not load contract workspace.');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle accept delivery
  const handleAcceptDelivery = async (deliveryId) => {
    setIsProcessingRelease(true);
    
    try {
      const response = await acceptDelivery(deliveryId, {
        feedback: 'Work approved. Great job!'
      });

      if (response.success) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.log('Confetti unavailable');
        }

        toast.success('Work Accepted!', 'Escrow released to freelancer.');
        setIsReviewModalOpen(true);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to accept delivery:', error);
      toast.error('Action Failed', error.response?.data?.message || 'Could not accept delivery.');
    } finally {
      setIsProcessingRelease(false);
    }
  };

  // Handle request revision
  const handleRequestRevision = async (deliveryId, feedback) => {
    try {
      const response = await requestRevision(deliveryId, { feedback });

      if (response.success) {
        toast.success('Revision Requested', 'Feedback sent to freelancer.');
        setActiveRevisionDelivery(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to request revision:', error);
      toast.error('Action Failed', error.response?.data?.message || 'Could not request revision.');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="warning" size="sm" dot>Submitted</Badge>;
      case 'revision_requested':
        return <Badge variant="danger" size="sm" dot>Revision Requested</Badge>;
      case 'accepted':
        return <Badge variant="success" size="sm" dot><CheckCheck className="w-3 h-3" /> Accepted</Badge>;
      default:
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
    }
  };

  // Get contract status badge
  const getContractStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
        return <Badge variant="warning" size="sm">Pending Payment</Badge>;
      case 'active':
        return <Badge variant="primary" size="sm">Active</Badge>;
      case 'submitted':
        return <Badge variant="warning" size="sm" dot>Work Submitted</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm" dot><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="sm" dot>Disputed</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contract not found</h2>
        <Link to="/dashboard/client/contracts" className="text-primary-600 mt-4 inline-block">
          Return to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          to="/dashboard/client/contracts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contracts</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getContractStatusBadge(contract.status)}
              <span className="text-xs text-slate-400">ID: #{contract._id?.slice(-6)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {contract.projectId?.title || 'Project'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Freelancer: <strong className="text-slate-900 dark:text-white">{contract.freelancerId?.name || 'Freelancer'}</strong></span>
              <span>•</span>
              <span>Deadline: {formatDate(contract.deadline)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/messages">
              <Button variant="outline" size="sm" icon={MessageSquare}>Message</Button>
            </Link>
            {contract.status === 'completed' && !hasReviewed && (
              <Button
                variant="primary"
                size="sm"
                icon={Star}
                onClick={() => setIsReviewModalOpen(true)}
              >
                Leave Review
              </Button>
            )}
            {hasReviewed && (
              <Badge variant="success" size="sm"><CheckCheck className="w-3 h-3" /> Reviewed</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contract Status */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Contract Status</h3>
        <ProjectProgress status={contract.status} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Deliveries */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Deliverables</h2>

          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <div
                key={delivery._id}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  delivery.status === 'submitted'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
                    : delivery.status === 'accepted'
                    ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Delivery v{delivery.version || 1}
                      </span>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {delivery.title || 'Work Submission'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted {formatDate(delivery.submittedAt || delivery.createdAt)}
                    </p>
                  </div>
                </div>

                {delivery.message && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {delivery.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  {delivery.liveUrl && (
                    <a href={delivery.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                  {delivery.githubUrl && (
                    <a href={delivery.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                      <GitBranch className="w-3.5 h-3.5" /> GitHub Repository
                    </a>
                  )}
                </div>

                {delivery.revisionMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
                    <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Revision Feedback:</span>
                      <span>"{delivery.revisionMessage}"</span>
                    </div>
                  </div>
                )}

                {delivery.status === 'submitted' && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 dark:text-rose-400"
                      onClick={() => setActiveRevisionDelivery(delivery)}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      icon={Check}
                      className="font-bold shadow-md"
                      onClick={() => handleAcceptDelivery(delivery._id)}
                      isLoading={isProcessingRelease}
                    >
                      Accept Work & Release Payment
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No deliveries submitted yet.</p>
            </div>
          )}
        </div>

        {/* Escrow Summary */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escrow Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Contract Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(contract.amount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Platform Fee (5%):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(contract.platformFee || 0)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Freelancer Receives:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(contract.freelancerAmount || contract.amount || 0)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Funds are securely held in escrow until you approve the work.</span>
            </div>
          </div>

          {/* Freelancer Info */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Freelancer</h3>
            <div className="flex items-center gap-3.5">
              <Avatar src={contract.freelancerId?.avatar} name={contract.freelancerId?.name} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{contract.freelancerId?.name || 'Freelancer'}</h4>
                <p className="text-xs text-slate-400">{contract.freelancerId?.email || ''}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link to={`/freelancers/${contract.freelancerId?._id}`}>
                <Button variant="outline" size="sm" className="w-full">View Public Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {activeRevisionDelivery && (
        <RequestRevisionModal
          isOpen={!!activeRevisionDelivery}
          onClose={() => setActiveRevisionDelivery(null)}
          delivery={activeRevisionDelivery}
          onConfirm={(feedback) => handleRequestRevision(activeRevisionDelivery._id, feedback)}
        />
      )}

      {/* Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          fetchData(); // ✅ Refresh after review
        }}
        contract={contract}
      />
    </div>
  );
}

export default ClientContractWorkspacePage;
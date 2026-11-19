// client/src/pages/client/ClientContractWorkspacePage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getContractById } from '../../services/contract.service';
import {
  getContractDeliveries,
  acceptDelivery,
  requestRevision,
} from '../../services/delivery.service';
import { getMyReviews } from '../../services/review.service';
import { RequestRevisionModal } from '../../components/project/RequestRevisionModal';
import { WriteReviewModal } from '../../components/project/WriteReviewModal';
import { ProjectProgress } from '../../components/dashboard/ProjectProgress';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  GitBranch,
  FileText,
  MessageSquare,
  Star,
  Check,
  RotateCcw,
  IndianRupee,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLATFORM_FEE_RATE = 0.05;
const MAX_CONFETTI_PARTICLES = 90;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safeFormatCurrency = (v) => {
  const n = safeNumber(v);
  try {
    return formatCurrency(n);
  } catch {
    return `₹${n.toLocaleString('en-IN')}`;
  }
};

const safeFormatDate = (d) => {
  if (!d) return '—';
  try {
    return formatDate ? formatDate(d) : new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
};

/* ------------------------------------------------------------------ */
/*  Status config — single source of truth                             */
/* ------------------------------------------------------------------ */
const CONTRACT_STATUS = {
  pending_payment:    { label: 'Pending Payment',    variant: 'warning' },
  active:             { label: 'Active',             variant: 'primary' },
  submitted:          { label: 'Work Submitted',     variant: 'warning', icon: CheckCheck },
  revision_requested: { label: 'Revision Requested', variant: 'danger'  },
  completed:          { label: 'Completed',          variant: 'success', icon: CheckCircle2 },
  cancelled:          { label: 'Cancelled',          variant: 'danger'  },
  disputed:           { label: 'Disputed',           variant: 'danger'  },
};

const DELIVERY_STATUS = {
  submitted:          { label: 'Submitted',          variant: 'warning' },
  revision_requested: { label: 'Revision Requested', variant: 'danger'  },
  accepted:           { label: 'Accepted',           variant: 'success', icon: CheckCheck },
  pending:            { label: 'Pending',            variant: 'primary' },
};

export function ClientContractWorkspacePage() {
  const { id } = useParams();
  const toast = useToast();

  /* ---------- Data ---------- */
  const [contract, setContract] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Modals & actions ---------- */
  const [activeRevisionDelivery, setActiveRevisionDelivery] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [confirmAcceptDelivery, setConfirmAcceptDelivery] = useState(null);

  const [isProcessingAccept, setIsProcessingAccept] = useState(false);

  /* ---------------- Derived ---------- */
  const hasReviewed = useMemo(
    () =>
      myReviews.some(
        (r) => r.contractId?._id === id || r.contractId === id
      ),
    [myReviews, id]
  );

  const submittedDelivery = useMemo(
    () => deliveries.find((d) => d.status === 'submitted'),
    [deliveries]
  );

  const escrowBreakdown = useMemo(() => {
    if (!contract) return { amount: 0, fee: 0, freelancer: 0 };
    const amount = safeNumber(contract.amount);
    const fee = safeNumber(
      contract.platformFee ?? Math.round(amount * PLATFORM_FEE_RATE)
    );
    const freelancer = safeNumber(
      contract.freelancerAmount ?? amount - fee
    );
    return { amount, fee, freelancer };
  }, [contract]);

  /* ---------------- Fetch ---------------- */
  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;

      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [contractRes, deliveriesRes, reviewsRes] = await Promise.all([
          getContractById(id),
          getContractDeliveries(id),
          getMyReviews(),
        ]);

        if (!contractRes?.success) {
          throw new Error(contractRes?.message || 'Contract not found');
        }

        setContract(contractRes.contract);

        if (deliveriesRes?.success) {
          setDeliveries(deliveriesRes.deliveries || []);
        }
        if (reviewsRes?.success) {
          setMyReviews(reviewsRes.reviews || []);
        }

        if (silent) {
          toast.success('Refreshed', 'Workspace is up to date.');
        }
      } catch (error) {
        console.error('[ClientContractWorkspace] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setContract(null);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [id, toast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------- Confetti (safe) ---------------- */
  const celebrate = useCallback(async () => {
    try {
      confetti({
        particleCount: MAX_CONFETTI_PARTICLES,
        spread: 70,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti is a nice-to-have optimization; fail silently if package is missing
    }
  }, []);

  /* ---------------- Accept delivery ---------------- */
  const handleAcceptDeliverySubmit = useCallback(async () => {
    if (!confirmAcceptDelivery) return;

    const deliveryId = confirmAcceptDelivery._id;
    setIsProcessingAccept(true);
    const currentEscrow = escrowBreakdown.freelancer;
    setConfirmAcceptDelivery(null);

    try {
      const response = await acceptDelivery(deliveryId, {
        feedback: 'Work approved. Great job!',
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Could not accept delivery');
      }

      celebrate();
      toast.success(
        'Work Accepted!',
        `${safeFormatCurrency(currentEscrow)} released to freelancer.`
      );

      setTimeout(() => setIsReviewModalOpen(true), 300);
      fetchData({ silent: true });
    } catch (error) {
      console.error('[ClientContractWorkspace] accept failed:', error);
      toast.error(
        'Action Failed',
        error?.response?.data?.message || error?.message || 'Something went wrong'
      );
    } finally {
      setIsProcessingAccept(false);
    }
  }, [confirmAcceptDelivery, escrowBreakdown.freelancer, celebrate, toast, fetchData]);

  /* ---------------- Revision handling ---------------- */
  const handleRequestRevisionSubmit = useCallback(async (deliveryId, reason) => {
    try {
      const response = await requestRevision(deliveryId, { reason });
      if (!response?.success) {
        throw new Error(response?.message || 'Could not process revision request.');
      }
      toast.success('Revision Requested', 'The freelancer has been notified.');
      setActiveRevisionDelivery(null);
      fetchData({ silent: true });
    } catch (error) {
      toast.error('Submission Failed', error?.message || 'Please try again.');
    }
  }, [toast, fetchData]);

  /* ---------------- View Templates & Shell States ---------------- */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading contract workspace...</p>
      </div>
    );
  }

  if (loadError || !contract) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load workspace"
          description={loadError?.message || 'The requested contract could not be retrieved.'}
          action={
            <Button onClick={() => fetchData()} variant="primary" icon={RefreshCw}>
              Retry Loading
            </Button>
          }
        />
      </div>
    );
  }

  const statusConfig = CONTRACT_STATUS[contract.status] || { label: contract.status, variant: 'neutral' };
  const StatusIcon = statusConfig.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/client/contracts" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              Contract Workspace
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={statusConfig.variant} icon={StatusIcon}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Contract Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">              
            Contract Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Project Title</span>
              <p className="text-base font-medium text-slate-900 dark:text-white">{contract.projectTitle}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Contract Amount</span>
              <p className="text-base font-medium text-slate-900 dark:text-white">{safeFormatCurrency(contract.amount)}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Deadline</span>
              <p className="text-base font-medium text-slate-900 dark:text-white">{safeFormatDate(contract.deadline)}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Escrow Breakdown</span>
              <p className="text-base font-medium text-slate-900 dark:text-white">
                {safeFormatCurrency(escrowBreakdown.amount)} (Client) - {safeFormatCurrency(escrowBreakdown.fee)} (Platform Fee) - {safeFormatCurrency(escrowBreakdown.freelancer)} (Freelancer)
              </p>
            </div>
          </div>
        </div>

        {/* Deliveries Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">      
            Deliveries
          </h2>
          {deliveries.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Deliveries Yet"
              description="The freelancer has not submitted any work yet."
            />
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => {
                const deliveryStatusConfig = DELIVERY_STATUS[delivery.status] || { label: delivery.status, variant: 'neutral' };
                const DeliveryStatusIcon = deliveryStatusConfig.icon || AlertCircle;

                return (
                  <div key={delivery._id} className="bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{delivery.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Submitted on {safeFormatDate(delivery.submittedAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={deliveryStatusConfig.variant} icon={DeliveryStatusIcon}>
                        {deliveryStatusConfig.label}
                      </Badge>
                      {delivery.status === 'submitted' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="success"
                            size="sm"
                            icon={Check}
                            onClick={() => setConfirmAcceptDelivery(delivery)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => setActiveRevisionDelivery(delivery)}
                          >
                            Request Revision
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeRevisionDelivery && (
        <RequestRevisionModal
          delivery={activeRevisionDelivery}
          onClose={() => setActiveRevisionDelivery(null)}
          onSubmit={handleRequestRevisionSubmit}
        />
      )}
      {isReviewModalOpen && (
        <WriteReviewModal
          contract={contract}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={() => {
            setIsReviewModalOpen(false);
            fetchData({ silent: true });
          }}
        />
      )}
      {confirmAcceptDelivery && (
        <ConfirmDialog
          title="Confirm Accept Delivery"
          description={`Are you sure you want to accept this delivery? This will release ${safeFormatCurrency(escrowBreakdown.freelancer)} to the freelancer.`}
          isOpen={!!confirmAcceptDelivery}
          onClose={() => setConfirmAcceptDelivery(null)}
          onConfirm={handleAcceptDeliverySubmit}
          isProcessing={isProcessingAccept}
        />
      )}
    </div>    
  );
}
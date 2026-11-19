// client/src/pages/freelancer/FreelancerContractWorkspacePage.jsx
import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getContractById } from '../../services/contract.service';
import {
  getContractDeliveries,
  createDelivery,
  updateDelivery,
} from '../../services/delivery.service';
import { SubmitWorkModal } from '../../components/project/SubmitWorkModal';
import { ProjectProgress } from '../../components/dashboard/ProjectProgress';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  GitBranch,
  FileText,
  MessageSquare,
  Upload,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  CheckCheck,
  Clock,
  IndianRupee,
  User as UserIcon,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLATFORM_FEE_RATE = 0.05;

const CONTRACT_STATUS = {
  pending_payment:    { label: 'Pending Payment',    variant: 'warning' },
  active:             { label: 'Active',             variant: 'primary' },
  submitted:          { label: 'Under Review',       variant: 'warning', icon: CheckCheck     },
  revision_requested: { label: 'Revision Requested', variant: 'danger'  },
  completed:          { label: 'Completed',          variant: 'success', icon: CheckCircle2  },
  cancelled:          { label: 'Cancelled',          variant: 'danger'  },
  disputed:           { label: 'Disputed',           variant: 'danger'  },
};

const DELIVERY_STATUS = {
  submitted:          { label: 'Under Client Review', variant: 'warning' },
  revision_requested: { label: 'Revision Requested',  variant: 'danger'  },
  accepted:           { label: 'Accepted & Paid',     variant: 'success', icon: CheckCheck },
  pending:            { label: 'Draft',               variant: 'default' },
};

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

const getContractStatusConfig = (status) =>
  CONTRACT_STATUS[status] || {
    label: status || 'Unknown',
    variant: 'default',
  };

const getDeliveryStatusConfig = (status) =>
  DELIVERY_STATUS[status] || {
    label: status || 'Unknown',
    variant: 'default',
  };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function FreelancerContractWorkspacePage() {
  const { id } = useParams();
  const toast = useToast();

  /* ---------- Data ---------- */
  const [contract, setContract] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Modals ---------- */
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeDeliveryForRevision, setActiveDeliveryForRevision] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- Derived ---------------- */
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

  /**
   * The freelancer can submit new work when:
   *  - the contract is active (not cancelled/completed/disputed)
   *  - there is NO delivery pending client review
   */
  const canSubmitWork = useMemo(() => {
    if (!contract) return false;

    const blockedStatuses = ['submitted', 'revision_requested'];
    const hasPendingDelivery = deliveries.some((d) =>
      blockedStatuses.includes(d.status)
    );

    const contractAllowsSubmission = ['active', 'in_progress'].includes(
      contract.status
    );

    return contractAllowsSubmission && !hasPendingDelivery;
  }, [contract, deliveries]);

  /* ---------------- Fetch ---------------- */
  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;

      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [contractRes, deliveriesRes] = await Promise.all([
          getContractById(id),
          getContractDeliveries(id),
        ]);

        if (!contractRes?.success) {
          throw new Error(contractRes?.message || 'Contract not found');
        }

        setContract(contractRes.contract);
        setDeliveries(
          deliveriesRes?.success ? deliveriesRes.deliveries || [] : []
        );

        if (silent) {
          toast.success('Refreshed', 'Workspace is up to date.');
        }
      } catch (error) {
        console.error('[FreelancerContractWorkspace] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setContract(null);
          setDeliveries([]);
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

  /* ---------------- Submit new work ---------------- */
  const handleSubmitWork = useCallback(
    async (data) => {
      if (!data) return;

      setIsSubmitting(true);
      try {
        const payload = {
          contractId: id,
          title: data.title?.trim() || 'Work Submission',
          description: data.description?.trim() || '',
          message: data.message?.trim() || data.description?.trim() || '',
          attachments: data.attachments || [],
          githubUrl: data.githubUrl?.trim() || null,
          liveDemoUrl:
            data.liveDemoUrl?.trim() || data.liveUrl?.trim() || null,
        };

        const response = await createDelivery(payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Could not submit work');
        }

        toast.success(
          'Work Submitted!',
          'Your client has been notified and will review the delivery.'
        );
        setIsSubmitModalOpen(false);
        await fetchData({ silent: true });
      } catch (error) {
        console.error('[FreelancerContractWorkspace] submit failed:', error);
        toast.error(
          'Submit Failed',
          error?.response?.data?.message ||
            error?.message ||
            'Could not submit work.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, toast, fetchData]
  );

  /* ---------------- Resubmit after revision ---------------- */
  const handleResubmit = useCallback(
    async (data) => {
      if (!activeDeliveryForRevision || !data) return;

      setIsSubmitting(true);
      try {
        const payload = {
          title: data.title?.trim() || 'Work Submission',
          description: data.description?.trim() || '',
          message: data.message?.trim() || data.description?.trim() || '',
          attachments: data.attachments || [],
          githubUrl: data.githubUrl?.trim() || null,
          liveDemoUrl:
            data.liveDemoUrl?.trim() || data.liveUrl?.trim() || null,
        };

        const response = await updateDelivery(
          activeDeliveryForRevision._id,
          payload
        );
        if (!response?.success) {
          throw new Error(response?.message || 'Could not resubmit work');
        }

        toast.success(
          'Resubmitted!',
          'Your revised work is back with the client for review.'
        );
        setActiveDeliveryForRevision(null);
        await fetchData({ silent: true });
      } catch (error) {
        console.error('[FreelancerContractWorkspace] resubmit failed:', error);
        toast.error(
          'Resubmit Failed',
          error?.response?.data?.message ||
            error?.message ||
            'Could not resubmit work.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeDeliveryForRevision, toast, fetchData]
  );

  /* ---------------- Render: loading ---------------- */
  if (isLoading && !contract) {
    return <WorkspaceSkeleton />;
  }

  /* ---------------- Render: not found / error ---------------- */
  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Contract not found"
          description={
            loadError?.message ||
            "We couldn't find this contract. It may have been removed or you may not have access."
          }
          action={
            <Link to="/dashboard/freelancer/contracts">
              <Button variant="primary" size="sm" icon={ArrowLeft}>
                Back to Contracts
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------------- Render: main ---------------- */
  return (
    <div className="space-y-8 pb-12">
      {/* Back link */}
      <Link
        to="/dashboard/freelancer/contracts"
        className="inline-flex items-center gap-1.5 text-xs font-bold
                   text-slate-500 hover:text-slate-900
                   dark:text-slate-400 dark:hover:text-white
                   transition-colors focus:outline-none focus-visible:ring-2
                   focus-visible:ring-primary-500 rounded px-1"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Contracts
      </Link>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {getContractStatusBadge(contract.status)}
            <span className="font-mono text-xs text-slate-400">
              #{String(contract._id).slice(-6)}
            </span>
          </div>
          <h1
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-pretty"
            title={contract.projectId?.title}
          >
            {contract.projectId?.title || 'Untitled Project'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <UserIcon className="w-3 h-3" aria-hidden="true" />
              <strong className="text-slate-900 dark:text-white font-semibold">
                {contract.clientId?.name || 'Client'}
              </strong>
            </span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              Due {safeFormatDate(contract.deadline)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchData({ silent: true })}
            disabled={isRefreshing}
            aria-label="Refresh workspace"
            className={isRefreshing ? 'animate-pulse' : ''}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Link to="/messages">
            <Button variant="outline" size="sm" icon={MessageSquare}>
              Message Client
            </Button>
          </Link>
          {canSubmitWork && (
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => setIsSubmitModalOpen(true)}
              className="font-bold shadow-md"
            >
              Submit Work
            </Button>
          )}
        </div>
      </header>

      {/* Progress */}
      <section
        aria-label="Contract progress"
        className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Project Lifecycle
        </h2>
        <ProjectProgress status={contract.status} />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Deliveries */}
        <section
          aria-label="Deliveries"
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Deliveries
            </h2>
            {deliveries.length > 0 && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 tabular-nums">
                {deliveries.length} submission
                {deliveries.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {deliveries.length > 0 ? (
            <div className="space-y-5">
              {deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery._id}
                  delivery={delivery}
                  onResubmit={() => setActiveDeliveryForRevision(delivery)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No deliveries yet"
              description="Submit your work when ready. The client will be notified for review."
              action={
                canSubmitWork ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Upload}
                    onClick={() => setIsSubmitModalOpen(true)}
                  >
                    Submit First Delivery
                  </Button>
                ) : null
              }
            />
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Escrow summary */}
          <section
            aria-label="Escrow summary"
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Escrow Guarantee
              </h3>
              <IndianRupee
                className="w-3.5 h-3.5 text-emerald-500"
                aria-hidden="true"
              />
            </div>

            <dl className="space-y-3 text-xs">
              <Row
                label="Contract Amount"
                value={safeFormatCurrency(escrowBreakdown.amount)}
              />
              <Row
                label={`Platform Fee (${PLATFORM_FEE_RATE * 100}%)`}
                value={safeFormatCurrency(escrowBreakdown.fee)}
                valueClass="font-bold text-slate-500 dark:text-slate-400"
              />
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Row
                  label="You Receive"
                  value={safeFormatCurrency(escrowBreakdown.freelancer)}
                  valueClass="text-emerald-600 dark:text-emerald-400 font-bold text-sm"
                />
              </div>
            </dl>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] text-emerald-700 dark:text-emerald-400">
              <ShieldCheck
                className="w-4 h-4 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-pretty">
                Funds are pre-funded and released upon client approval.
              </span>
            </div>
          </section>

          {/* Client info */}
          <section
            aria-label="Client info"
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Client Info
            </h3>

            <div className="flex items-center gap-3.5">
              <Avatar
                src={contract.clientId?.avatar}
                name={contract.clientId?.name}
                size="md"
              />
              <div className="min-w-0">
                <h4
                  className="text-sm font-bold text-slate-900 dark:text-white truncate"
                  title={contract.clientId?.name}
                >
                  {contract.clientId?.name || 'Client'}
                </h4>
                <p
                  className="text-xs text-slate-400 truncate"
                  title={contract.clientId?.email}
                >
                  {contract.clientId?.email || ''}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link to="/messages" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Message Client
                </Button>
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {/* Submit modal */}
      {isSubmitModalOpen && (
        <SubmitWorkModal
          isOpen
          onClose={() => !isSubmitting && setIsSubmitModalOpen(false)}
          contract={contract}
          onSubmit={handleSubmitWork}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Resubmit modal */}
      {activeDeliveryForRevision && (
        <SubmitWorkModal
          isOpen
          onClose={() =>
            !isSubmitting && setActiveDeliveryForRevision(null)
          }
          contract={contract}
          delivery={activeDeliveryForRevision}
          onSubmit={handleResubmit}
          isRevision
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function getContractStatusBadge(status) {
  const config = getContractStatusConfig(status);
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} size="sm" dot>
      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
      {config.label}
    </Badge>
  );
}

function getDeliveryStatusBadge(status) {
  const config = getDeliveryStatusConfig(status);
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} size="sm" dot>
      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
      {config.label}
    </Badge>
  );
}

function Row({ label, value, valueClass = 'font-bold text-slate-900 dark:text-white' }) {
  return (
    <div className="flex justify-between gap-3 text-slate-600 dark:text-slate-400">
      <span>{label}</span>
      <span className={`tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

const DeliveryCard = React.memo(function DeliveryCard({ delivery, onResubmit }) {
  const isRevisionRequested = delivery.status === 'revision_requested';
  const isSubmitted = delivery.status === 'submitted';
  const isAccepted = delivery.status === 'accepted';

  const containerTint = isRevisionRequested
    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700/60'
    : isSubmitted
    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
    : isAccepted
    ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800'
    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';

  return (
    <article className={`p-6 rounded-2xl border transition-all space-y-4 ${containerTint}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              v{delivery.version || 1}
            </span>
            {getDeliveryStatusBadge(delivery.status)}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {delivery.title || 'Work Submission'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Submitted {safeFormatDate(delivery.submittedAt || delivery.createdAt)}
          </p>
        </div>
      </div>

      {/* Message */}
      {delivery.message && (
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-pretty">
          {delivery.message}
        </p>
      )}

      {/* Links */}
      {(delivery.liveUrl || delivery.githubUrl) && (
        <div className="flex flex-wrap gap-3">
          {delivery.liveUrl && (
            <a
              href={delivery.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold
                         text-primary-600 dark:text-primary-400 hover:underline
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              Live Demo
            </a>
          )}
          {delivery.githubUrl && (
            <a
              href={delivery.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold
                         text-slate-700 dark:text-slate-300 hover:underline
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded px-1"
            >
              <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
              GitHub Repository
            </a>
          )}
        </div>
      )}

      {/* Revision feedback */}
      {delivery.revisionMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>Client Requested Adjustments</span>
          </div>
          <p className="italic leading-relaxed text-pretty">
            &ldquo;{delivery.revisionMessage}&rdquo;
          </p>
        </div>
      )}

      {/* Resubmit */}
      {isRevisionRequested && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={onResubmit}
            className="font-bold shadow-md"
          >
            Resubmit Work
          </Button>
        </div>
      )}
    </article>
  );
});

function WorkspaceSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default FreelancerContractWorkspacePage;
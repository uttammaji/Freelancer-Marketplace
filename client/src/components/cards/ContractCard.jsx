// client/src/components/cards/ContractCard.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  CheckCheck,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Status configuration — single source of truth                      */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG = {
  pending_payment: {
    label: 'Pending Payment',
    variant: 'warning',
    progress: 0,
    barColor: 'bg-amber-500',
    icon: Clock,
  },
  active: {
    label: 'In Progress',
    variant: 'primary',
    progress: 50,
    barColor: 'bg-primary-600',
    icon: Clock,
  },
  submitted: {
    label: 'Work Submitted',
    variant: 'warning',
    progress: 75,
    barColor: 'bg-primary-500',
    icon: CheckCheck,
  },
  revision_requested: {
    label: 'Revision Requested',
    variant: 'danger',
    progress: 60,
    barColor: 'bg-rose-500',
    icon: AlertTriangle,
  },
  completed: {
    label: 'Completed',
    variant: 'success',
    progress: 100,
    barColor: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'danger',
    progress: 0,
    barColor: 'bg-slate-400',
    icon: XCircle,
  },
  disputed: {
    label: 'Disputed',
    variant: 'danger',
    progress: 0,
    barColor: 'bg-rose-500',
    icon: AlertTriangle,
  },
};

const DEFAULT_STATUS = {
  label: 'In Progress',
  variant: 'primary',
  progress: 0,
  barColor: 'bg-primary-600',
  icon: Clock,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeFormatDate = (date) => {
  if (!date) return 'No deadline';
  try {
    return formatDate(date);
  } catch {
    return 'Invalid date';
  }
};

const safeFormatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  try {
    return formatCurrency(num);
  } catch {
    return `₹${num.toLocaleString()}`;
  }
};

const getStatusBadge = (status) => {
  const config = STATUS_CONFIG[status] || DEFAULT_STATUS;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} size="sm" dot>
      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
      {config.label}
    </Badge>
  );
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ContractCard({ contract, role = 'client' }) {
  // Guard against missing contract
  if (!contract) return null;

  const isClient = role === 'client';

  // ---- Derived partner info (memoised) ----
  const { partnerName, partnerAvatar, partnerLabel } = useMemo(() => {
    if (isClient) {
      return {
        partnerName:
          contract.freelancerName ||
          contract.freelancerId?.name ||
          'Freelancer',
        partnerAvatar:
          contract.freelancerAvatar ||
          contract.freelancerId?.avatar ||
          '',
        partnerLabel: 'Hired Freelancer',
      };
    }
    return {
      partnerName:
        contract.clientName || contract.clientId?.name || 'Client',
      partnerAvatar:
        contract.clientAvatar || contract.clientId?.avatar || '',
      partnerLabel: 'Client',
    };
  }, [contract, isClient]);

  // ---- Derived amounts (memoised) ----
  const { contractAmount, escrowBalance } = useMemo(() => {
    const amount =
      Number(contract.amount ?? contract.totalBudget ?? 0) || 0;
    const escrow = Number(contract.escrowBalance ?? amount) || 0;
    return { contractAmount: amount, escrowBalance: escrow };
  }, [contract.amount, contract.totalBudget, contract.escrowBalance]);

  // ---- Status config ----
  const statusConfig = STATUS_CONFIG[contract.status] || DEFAULT_STATUS;
  const { label: statusLabel, progress, barColor } = statusConfig;

  // ---- Routing ----
  const contractId = contract.id || contract._id;
  const basePath = isClient
    ? '/dashboard/client/contracts'
    : '/dashboard/freelancer/contracts';
  const targetLink = contractId
    ? `${basePath}/${contractId}`
    : '/';

  // ---- Titles ----
  const projectTitle =
    contract.projectTitle || contract.projectId?.title || 'Untitled Project';

  const progressWidth = `${Math.min(100, Math.max(0, progress))}%`;

  return (
    <article
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between"
      aria-label={`Contract for ${projectTitle}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(contract.status)}
            <span className="text-xs text-slate-400">
              Due {safeFormatDate(contract.deadline)}
            </span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
            {safeFormatCurrency(contractAmount)}
          </span>
        </div>

        {/* Project Title */}
        <Link
          to={targetLink}
          className="block group mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          <h3
            className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate"
            title={projectTitle}
          >
            {projectTitle}
          </h3>
        </Link>

        {/* Partner Info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl mb-4">
          <Avatar src={partnerAvatar} alt={partnerName} size="sm" />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-slate-400 block">
              {partnerLabel}
            </span>
            <span
              className="text-xs font-bold text-slate-900 dark:text-white truncate block"
              title={partnerName}
            >
              {partnerName}
            </span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400 capitalize">
              {statusLabel}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <div
            className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Contract progress"
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${barColor}`}
              style={{ width: progressWidth }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          title={`Escrow balance: ${safeFormatCurrency(escrowBalance)}`}
        >
          <Shield
            className="w-3.5 h-3.5 text-emerald-500 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">
            Escrow: {safeFormatCurrency(escrowBalance)}
          </span>
        </div>

        <Link
          to={targetLink}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
        >
          <Button variant="outline" size="sm" iconRight={ArrowRight}>
            Workspace
          </Button>
        </Link>
      </div>
    </article>
  );
}

export default React.memo(ContractCard);
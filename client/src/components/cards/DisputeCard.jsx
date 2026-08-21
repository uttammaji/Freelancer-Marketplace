import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertTriangle, ShieldCheck, Check, Scale } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';

export function DisputeCard({ dispute }) {
  const { resolveDispute } = useMarketplace();
  const toast = useToast();
  const [activeModal, setActiveModal] = useState(null); // 'refund_client' | 'release_freelancer' | 'split'

  const handleResolution = (actionType, actionLabel) => {
    resolveDispute(dispute.id, actionLabel);
    toast.success('Dispute Resolved', `Applied: ${actionLabel}`);
    setActiveModal(null);
  };

  const isResolved = dispute.status === 'resolved';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Case #{dispute.id}</span>
            {isResolved ? (
              <Badge variant="success" size="sm" dot>Resolved</Badge>
            ) : (
              <Badge variant="danger" size="sm" dot>Open Dispute</Badge>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {dispute.projectTitle}
          </h3>
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
            Reason: {dispute.reason}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Disputed Escrow</span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(dispute.disputeAmount)}
          </span>
        </div>
      </div>

      {/* Claims Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Client Claim:</span>
            <span className="text-slate-500">({dispute.clientName})</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{dispute.clientClaim}"
          </p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Freelancer Claim:</span>
            <span className="text-slate-500">({dispute.freelancerName})</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
            "{dispute.freelancerClaim}"
          </p>
        </div>
      </div>

      {/* Footer / Administrative actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          Opened {formatDate(dispute.createdAt)}
        </span>

        {isResolved ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Check className="w-4 h-4" />
            <span>Resolution: {dispute.resolutionAction || 'Arbitrated'}</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal('refund_client')}
            >
              Refund Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal('release_freelancer')}
            >
              Release to Freelancer
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Scale}
              onClick={() => setActiveModal('split')}
            >
              Split 50 / 50
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={activeModal === 'refund_client'}
        onClose={() => setActiveModal(null)}
        onConfirm={() => handleResolution('refund_client', 'Full Refund to Client')}
        title="Refund Client in Full"
        message={`Are you sure you want to refund ${formatCurrency(dispute.disputeAmount)} from escrow back to client ${dispute.clientName}?`}
        confirmText="Execute Refund"
      />

      <ConfirmDialog
        isOpen={activeModal === 'release_freelancer'}
        onClose={() => setActiveModal(null)}
        onConfirm={() => handleResolution('release_freelancer', 'Full Payout to Freelancer')}
        title="Release Full Payment to Freelancer"
        message={`Are you sure you want to release ${formatCurrency(dispute.disputeAmount)} from escrow to freelancer ${dispute.freelancerName}?`}
        confirmText="Release Funds"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={activeModal === 'split'}
        onClose={() => setActiveModal(null)}
        onConfirm={() => handleResolution('split', 'Split 50% Client / 50% Freelancer')}
        title="Split Disputed Amount (50/50)"
        message={`This will return ${formatCurrency(dispute.disputeAmount / 2)} to ${dispute.clientName} and pay ${formatCurrency(dispute.disputeAmount / 2)} to ${dispute.freelancerName}.`}
        confirmText="Confirm 50/50 Split"
        variant="primary"
      />
    </div>
  );
}

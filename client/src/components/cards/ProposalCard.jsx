import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Rating } from '../common/Rating';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Clock, CheckCircle2, MessageSquare, Check, X, ShieldCheck } from 'lucide-react';

export function ProposalCard({
  proposal,
  onHire,
  onShortlist,
  onReject,
  onMessage,
  isClientView = true
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success" size="sm" dot>Hired</Badge>;
      case 'shortlisted':
        return <Badge variant="primary" size="sm" dot>Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm" dot>Declined</Badge>;
      default:
        return <Badge variant="warning" size="sm" dot>Pending Review</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-soft transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3.5">
          <Avatar
            src={proposal.freelancerAvatar}
            alt={proposal.freelancerName}
            size="lg"
            isOnline={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/freelancers/${proposal.freelancerId}`}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {proposal.freelancerName}
              </Link>
              {getStatusBadge(proposal.status)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {proposal.freelancerTitle}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Rating value={proposal.freelancerRating || 5.0} reviewsCount={proposal.freelancerReviewsCount || 10} size="xs" />
              <span className="text-[11px] text-slate-400">• {proposal.freelancerLocation}</span>
            </div>
          </div>
        </div>

        {/* Bid & Delivery Info */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl sm:min-w-[130px] text-right">
          <div>
            <span className="text-xs text-slate-400 block">Proposed Bid</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {formatCurrency(proposal.bidAmount)}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{proposal.deliveryTime}</span>
          </div>
        </div>
      </div>

      {/* Cover letter */}
      <div className="my-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-850/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 leading-relaxed whitespace-pre-line">
        {proposal.coverLetter}
      </div>

      {/* Attachments if any */}
      {proposal.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {proposal.attachments.map((att, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60"
            >
              <span>📎 {att.name}</span>
              {att.size && <span className="text-[10px] text-primary-500">({att.size})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Footer / Actions for Client */}
      {isClientView && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Submitted {formatDate(proposal.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            <Link to="/messages">
              <Button variant="outline" size="sm" icon={MessageSquare}>
                Chat
              </Button>
            </Link>

            {proposal.status !== 'accepted' && (
              <>
                {proposal.status !== 'shortlisted' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShortlist && onShortlist(proposal.id)}
                  >
                    Shortlist
                  </Button>
                )}
                {proposal.status !== 'rejected' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    onClick={() => onReject && onReject(proposal.id)}
                  >
                    Decline
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  onClick={() => onHire && onHire(proposal)}
                >
                  Hire & Fund Escrow
                </Button>
              </>
            )}

            {proposal.status === 'accepted' && (
              <Badge variant="success" size="lg">
                <Check className="w-4 h-4 mr-1" /> Active Contract
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

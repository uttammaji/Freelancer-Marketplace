import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Clock, Shield, CheckCircle2, AlertCircle, ArrowRight, FolderKanban } from 'lucide-react';

export function ContractCard({ contract, role = 'client' }) {
  const isClient = role === 'client';
  const partnerName = isClient ? contract.freelancerName : contract.clientName;
  const partnerAvatar = isClient ? contract.freelancerAvatar : contract.clientAvatar;
  const targetLink = isClient ? `/dashboard/client/contracts/${contract.id}` : `/dashboard/freelancer/contracts/${contract.id}`;

  const completedMilestones = contract.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = contract.milestones?.length || 1;
  const progressPercent = Math.round((completedMilestones / totalMilestones) * 100);

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'completed':
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case 'submitted':
        return <Badge variant="warning" size="sm" dot>Work Submitted</Badge>;
      case 'revision_requested':
        return <Badge variant="danger" size="sm" dot>Revision Requested</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="sm" dot>In Dispute</Badge>;
      default:
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-xs text-slate-400">Due {formatDate(contract.deadline)}</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(contract.totalBudget)}
          </span>
        </div>

        {/* Project Title */}
        <Link to={targetLink} className="block group mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {contract.projectTitle}
          </h3>
        </Link>

        {/* Partner Info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl mb-4">
          <Avatar src={partnerAvatar} alt={partnerName} size="sm" />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-slate-400 block">{isClient ? 'Hired Freelancer' : 'Client'}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{partnerName}</span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400">
              Milestone Progress ({completedMilestones}/{totalMilestones})
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                contract.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Escrow: {formatCurrency(contract.escrowBalance || 0)}</span>
        </div>

        <Link to={targetLink}>
          <Button variant="outline" size="sm" iconRight={ArrowRight}>
            Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
}

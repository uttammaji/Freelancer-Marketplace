// client/src/components/cards/ContractCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Clock, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FolderKanban,
  IndianRupee,
  Wallet,
  CheckCheck,
} from 'lucide-react';

export function ContractCard({ contract, role = 'client' }) {
  const isClient = role === 'client';
  const partnerName = isClient 
    ? contract.freelancerName || contract.freelancerId?.name || 'Freelancer'
    : contract.clientName || contract.clientId?.name || 'Client';
  const partnerAvatar = isClient 
    ? contract.freelancerAvatar || contract.freelancerId?.avatar || ''
    : contract.clientAvatar || contract.clientId?.avatar || '';
  const targetLink = isClient 
    ? `/dashboard/client/contracts/${contract.id || contract._id}` 
    : `/dashboard/freelancer/contracts/${contract.id || contract._id}`;

  // Real amount fields
  const contractAmount = contract.amount || contract.totalBudget || 0;
  const escrowBalance = contract.escrowBalance || contractAmount;
  const freelancerAmount = contract.freelancerAmount || contractAmount;

  // Status badge
  const getStatusBadge = () => {
    switch (contract.status) {
      case 'pending_payment':
        return <Badge variant="warning" size="sm" dot>Pending Payment</Badge>;
      case 'active':
        return <Badge variant="primary" size="sm" dot>Active</Badge>;
      case 'submitted':
        return <Badge variant="warning" size="sm" dot><CheckCheck className="w-3 h-3" /> Work Submitted</Badge>;
      case 'revision_requested':
        return <Badge variant="danger" size="sm" dot>Revision Requested</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm" dot><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="sm" dot>Disputed</Badge>;
      default:
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            <span className="text-xs text-slate-400">Due {formatDate(contract.deadline)}</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(contractAmount)}
          </span>
        </div>

        {/* Project Title */}
        <Link to={targetLink} className="block group mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
            {contract.projectTitle || contract.projectId?.title || 'Project'}
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

        {/* Contract Status Indicator */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400 capitalize">
              {contract.status === 'active' ? 'In Progress' : contract.status.replace(/_/g, ' ')}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {contract.status === 'completed' ? '100%' : contract.status === 'active' ? '50%' : '0%'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                contract.status === 'completed' ? 'bg-emerald-500' : contract.status === 'active' ? 'bg-primary-600' : 'bg-amber-500'
              }`}
              style={{ 
                width: contract.status === 'completed' ? '100%' : contract.status === 'active' ? '50%' : '0%' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Escrow: {formatCurrency(escrowBalance)}</span>
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

export default ContractCard;
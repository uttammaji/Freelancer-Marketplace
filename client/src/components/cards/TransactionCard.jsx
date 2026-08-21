import React from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Shield, RefreshCw } from 'lucide-react';

export function TransactionCard({ tx }) {
  const getIcon = () => {
    switch (tx.type) {
      case 'withdrawal':
        return <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl"><ArrowUpRight className="w-4 h-4" /></div>;
      case 'escrow_deposit':
        return <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl"><Shield className="w-4 h-4" /></div>;
      default:
        return <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><ArrowDownLeft className="w-4 h-4" /></div>;
    }
  };

  const getStatusBadge = () => {
    switch (tx.status) {
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      default:
        return <Badge variant="default" size="sm">{tx.status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl gap-4 shadow-sm">
      <div className="flex items-start gap-3.5">
        {getIcon()}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {tx.description}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {tx.projectTitle || tx.invoiceNumber}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>{formatDate(tx.date)}</span>
            <span>•</span>
            <span>{tx.paymentMethod}</span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
        <span className={`text-base font-bold ${tx.type === 'withdrawal' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
          {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
        </span>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
}

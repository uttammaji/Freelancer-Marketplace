import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Shield, CreditCard, ArrowDownLeft } from 'lucide-react';

export function ManagePaymentsPage() {
  const { transactions } = useMarketplace();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Financial Treasury</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Platform Payments & Escrow Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete audit trail of deposits, milestone releases, and 5% platform commission collections
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Platform GMV"
          value="$184,500.00"
          isPositive={true}
          change="+28% MoM"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Net Commission Collected"
          value="$9,225.00"
          isPositive={true}
          icon={DollarSign}
          color="purple"
          subtitle="5% take-rate revenue"
        />
        <StatCard
          title="Active Escrow Balance"
          value="$14,800.00"
          icon={Shield}
          color="primary"
          subtitle="Held safely in custody"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Transaction Log</h2>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );
}

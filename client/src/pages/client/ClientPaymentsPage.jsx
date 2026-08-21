import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, Download, Shield, Plus, DollarSign, ArrowDownLeft } from 'lucide-react';

export function ClientPaymentsPage() {
  const { currentUser } = useAuth();
  const { transactions, contracts } = useMarketplace();
  const toast = useToast();

  const totalSpent = currentUser?.totalSpent || 48500;
  const inEscrow = contracts.reduce((sum, c) => sum + (c.escrowBalance || 0), 0);

  const handleDownloadInvoice = () => {
    toast.success('Invoice Downloaded', 'Official billing statement PDF has been generated.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Financial Accounting</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Payments & Escrow Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your payment methods, track escrow deposits, and download official invoices
          </p>
        </div>

        <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadInvoice}>
          Download Statement (PDF)
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Lifetime Spent"
          value={formatCurrency(totalSpent)}
          isPositive={true}
          change="+18.4%"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Current Escrow Balance"
          value={formatCurrency(inEscrow || 1400)}
          icon={Shield}
          color="primary"
          subtitle="Held safely for active milestones"
        />
        <StatCard
          title="Platform Processing Fee"
          value="0.00% (Free)"
          icon={DollarSign}
          color="purple"
          subtitle="Clients pay 0% fees on SkillHire"
        />
      </div>

      {/* Payment Methods Section */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Saved Payment Methods</h3>
          <Button variant="outline" size="sm" icon={Plus}>
            Add Card
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border-2 border-primary-500/40 bg-primary-50/20 dark:bg-primary-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
                VISA
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Visa ending in 4242</span>
                <span className="text-[11px] text-slate-400">Expires 09/28 • Primary Billing</span>
              </div>
            </div>
            <Badge variant="primary" size="sm">Default</Badge>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                MC
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Mastercard ending in 8821</span>
                <span className="text-[11px] text-slate-400">Expires 11/27 • Backup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h2>
          <span className="text-xs text-slate-400">{transactions.length} Records</span>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );
}

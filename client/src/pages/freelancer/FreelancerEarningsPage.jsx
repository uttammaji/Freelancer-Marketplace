import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  ArrowUpRight,
  Shield,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import confetti from 'canvas-confetti';

export function FreelancerEarningsPage() {
  const { currentUser } = useAuth();
  const { transactions } = useMarketplace();
  const toast = useToast();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(3610);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableBalance = 4250.00;
  const inEscrow = 1400.00;
  const totalEarned = currentUser?.totalEarned || 84200;

  const earningsTimeline = [
    { month: 'Mar', amount: 5200 },
    { month: 'Apr', amount: 7400 },
    { month: 'May', amount: 6800 },
    { month: 'Jun', amount: 9500 },
    { month: 'Jul', amount: 11800 },
    { month: 'Aug', amount: 14200 }
  ];

  const handleWithdrawal = (e) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > availableBalance) {
      toast.warning('Invalid Amount', `Please enter an amount up to ${formatCurrency(availableBalance)}`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }
      setIsProcessing(false);
      toast.success('Payout Initiated! 💸', `${formatCurrency(withdrawAmount)} has been scheduled for transfer to your payout method.`);
      setIsWithdrawModalOpen(false);
    }, 700);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="success" size="sm" className="mb-2">Financial Accounting</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Earnings & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your net revenues, pending escrow releases, and withdraw funds securely
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={ArrowUpRight}
          className="font-bold shadow-md"
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          Withdraw Available Funds ({formatCurrency(availableBalance)})
        </Button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Available for Withdrawal"
          value={formatCurrency(availableBalance)}
          isPositive={true}
          change="Instant Payout Ready"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending in Escrow"
          value={formatCurrency(inEscrow)}
          icon={Shield}
          color="primary"
          subtitle="Released upon milestone approval"
        />
        <StatCard
          title="Lifetime Total Earned"
          value={formatCurrency(totalEarned)}
          change="+24% YoY"
          isPositive={true}
          icon={CreditCard}
          color="purple"
          subtitle="All completed contracts"
        />
      </div>

      {/* Recharts Area Graph */}
      <ChartCard
        title="Historical Monthly Revenue"
        subtitle="Cumulative monthly earnings credited to your balance"
        action={<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">5% Take-Rate Protected</span>}
      >
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Net Revenue']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#earningsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Payout Methods */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Payout Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Direct Bank Transfer (HDFC)</span>
                <span className="text-[11px] text-slate-400">Account ending in •••• 9104</span>
              </div>
            </div>
            <Badge variant="success" size="sm">Primary</Badge>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">PayPal International</span>
                <span className="text-[11px] text-slate-400">rahul.sharma@devstack.io</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions & Payouts</h2>
          <span className="text-xs text-slate-400">{transactions.length} Records</span>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))}
        </div>
      </div>

      {/* Payout Withdrawal Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Available Funds"
        subtitle={`Available for transfer: ${formatCurrency(availableBalance)}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <Input
            label="Withdrawal Amount ($ USD)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            icon={DollarSign}
            max={availableBalance}
            min={50}
            required
            helperText="Zero withdrawal transfer fees on bank transfers."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Destination
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-emerald-50/20 cursor-pointer">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Bank (•••• 9104)</span>
                <input type="radio" name="payoutMethod" checked={payoutMethod === 'bank'} onChange={() => setPayoutMethod('bank')} />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="text-xs font-bold text-slate-900 dark:text-white">PayPal</span>
                <input type="radio" name="payoutMethod" checked={payoutMethod === 'paypal'} onChange={() => setPayoutMethod('paypal')} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={ArrowUpRight} isLoading={isProcessing}>
              Confirm Payout ({formatCurrency(withdrawAmount)})
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

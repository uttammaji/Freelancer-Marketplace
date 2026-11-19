// client/src/pages/freelancer/FreelancerEarningsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyTransactions, getTransactionStats } from '../../services/transaction.service';
import { getFreelancerPayments } from '../../services/payment.service';
import { getMyPayoutMethods, createPayout, checkPayoutStatus } from '../../services/payout.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  IndianRupee,
  ArrowUpRight,
  Shield,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  Landmark,
  CheckCircle2,
  Clock,
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
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [selectedPayoutMethodId, setSelectedPayoutMethodId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const pollIntervalRef = useRef(null);

  // Fetch earnings data
  const fetchEarningsData = useCallback(async () => {
    try {
      const [transactionsRes, paymentsRes, payoutMethodsRes] = await Promise.all([
        getMyTransactions({ limit: 50 }),
        getFreelancerPayments(),
        getMyPayoutMethods(),
      ]);

      if (transactionsRes.success) {
        setTransactions(transactionsRes.transactions || []);
      }

      if (paymentsRes.success) {
        setPayments(paymentsRes.payments || []);
      }

      if (payoutMethodsRes.success) {
        const methods = payoutMethodsRes.payoutMethods || [];
        setPayoutMethods(methods);
        const primary = methods.find(m => m.isPrimary);
        if (primary) {
          setSelectedPayoutMethodId(primary._id);
        } else if (methods.length > 0) {
          setSelectedPayoutMethodId(methods[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchEarningsData]);

  // ✅ CORRECTED STATS CALCULATION
  const totalEarned = transactions
    .filter(tx => tx.direction === 'credit' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawn = transactions
    .filter(tx => tx.direction === 'debit' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingWithdrawal = transactions
    .filter(tx => tx.direction === 'debit' && tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawal;

  // Escrow: payments still held
const inEscrow = transactions
  .filter(tx => tx.type === 'freelancer_earning' && tx.status === 'pending')
  .reduce((sum, tx) => sum + tx.amount, 0);

  // Generate earnings timeline
  const generateEarningsData = (txList) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().slice(0, 7);
      const monthEarnings = txList
        .filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate.toISOString().slice(0, 7) === monthKey && 
                 tx.direction === 'credit' && 
                 tx.status === 'completed';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      data.push({
        month: months[monthDate.getMonth()],
        amount: monthEarnings,
      });
    }

    return data;
  };

  const earningsTimeline = generateEarningsData(transactions);

  // Map transaction
  const mapTransaction = (tx) => ({
    id: tx._id,
    description: tx.description || '',
    projectTitle: tx.projectId?.title || '',
    amount: tx.amount,
    type: tx.type,
    status: tx.status,
    direction: tx.direction,
    date: tx.createdAt,
    paymentMethod: tx.direction === 'credit' ? 'Escrow Release' : 
                   tx.type === 'withdrawal' ? 'Payout' : 'Platform Fee',
  });

  // Poll payout status
  const pollPayoutStatus = useCallback((payoutId) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await checkPayoutStatus(payoutId);
        
        if (response.success) {
          const status = response.payout.status;
          
          if (status === 'processed') {
            clearInterval(pollIntervalRef.current);
            toast.success('Payout Completed!', 'Money sent to your account.');
            fetchEarningsData();
          }
          
          if (['rejected', 'failed', 'reversed'].includes(status)) {
            clearInterval(pollIntervalRef.current);
            toast.error('Payout Failed', response.payout.failureReason || 'Payout could not be processed.');
            fetchEarningsData();
          }
        }
      } catch (error) {
        clearInterval(pollIntervalRef.current);
        console.error('Polling failed:', error);
      }
    }, 5000);
  }, [toast, fetchEarningsData]);

  // Handle withdrawal
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    if (withdrawAmount <= 0) {
      toast.warning('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast.warning('Insufficient Balance', `You can withdraw up to ${formatCurrency(availableBalance)}`);
      return;
    }

    if (withdrawAmount < 100) {
      toast.warning('Minimum Withdrawal', 'Minimum withdrawal amount is ₹100.');
      return;
    }

    if (!selectedPayoutMethodId) {
      toast.warning('No Payout Method', 'Please select a payout method.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await createPayout({
        amount: withdrawAmount,
        payoutMethodId: selectedPayoutMethodId,
      });

      if (response.success) {
        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        } catch (e) {
          console.log('Confetti unavailable');
        }

        toast.success('Payout Initiated!', `${formatCurrency(withdrawAmount)} is being processed.`);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount(0);
        
        pollPayoutStatus(response.payout.id);
        fetchEarningsData();
      }
    } catch (error) {
      console.error('Payout failed:', error);
      toast.error('Payout Failed', error.response?.data?.message || 'Could not process payout.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading earnings...</p>
        </div>
      </div>
    );
  }

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
          onClick={() => {
            setWithdrawAmount(availableBalance);
            setIsWithdrawModalOpen(true);
          }}
          disabled={payoutMethods.length === 0 || availableBalance <= 0}
        >
          {payoutMethods.length === 0 
            ? 'Add Payout Method First' 
            : availableBalance <= 0 
              ? 'No Balance to Withdraw' 
              : `Withdraw (${formatCurrency(availableBalance)})`}
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Available for Withdrawal"
          value={formatCurrency(availableBalance)}
          isPositive={availableBalance > 0}
          change={pendingWithdrawal > 0 ? `${formatCurrency(pendingWithdrawal)} processing` : 'Ready to withdraw'}
          icon={IndianRupee}
          color="emerald"
          subtitle="Net of fees and pending payouts"
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
          change={`${transactions.length} transactions`}
          isPositive={true}
          icon={CreditCard}
          color="purple"
          subtitle="All completed contracts"
        />
        <StatCard
          title="Total Withdrawn"
          value={formatCurrency(totalWithdrawn)}
          change={pendingWithdrawal > 0 ? `${formatCurrency(pendingWithdrawal)} pending` : 'All completed'}
          isPositive={false}
          icon={ArrowUpRight}
          color="amber"
          subtitle="Lifetime payouts"
        />
      </div>

      {/* Earnings Chart */}
      <ChartCard
        title="Historical Monthly Revenue"
        subtitle="Monthly earnings credited to your balance"
        action={
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
            5% Platform Fee
          </span>
        }
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
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Net Revenue']}
              />
              <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#earningsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Payout Methods */}
      {payoutMethods.length > 0 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Payout Methods</h3>
            <Badge variant="success" size="sm">{payoutMethods.length} active</Badge>
          </div>

          <div className="space-y-3">
            {payoutMethods.map((method) => (
              <div
                key={method._id}
                className={`p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                  selectedPayoutMethodId === method._id
                    ? 'border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
                onClick={() => setSelectedPayoutMethodId(method._id)}
              >
                <div className={`p-2.5 rounded-xl ${method.type === 'upi' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-primary-100 dark:bg-primary-950 text-primary-600'}`}>
                  {method.type === 'upi' ? <Smartphone className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {method.type === 'upi' ? method.displayInfo || method.upiId : `${method.bankName} ••••${method.accountNumber?.slice(-4)}`}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize">{method.type}</span>
                </div>
                {method.isPrimary && <Badge variant="success" size="sm">Primary</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions & Payouts</h2>
          <span className="text-xs text-slate-400">{transactions.length} records</span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <TransactionCard key={tx._id} tx={mapTransaction(tx)} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <IndianRupee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No transactions yet.</p>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Available Funds"
        subtitle={`Available: ${formatCurrency(availableBalance)}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <Input
            label="Withdrawal Amount (₹ INR)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            icon={IndianRupee}
            max={availableBalance}
            min={100}
            required
            helperText={`Minimum: ₹100 • Maximum: ${formatCurrency(availableBalance)}`}
          />

          {payoutMethods.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payout Destination
              </label>
              <select
                value={selectedPayoutMethodId}
                onChange={(e) => setSelectedPayoutMethodId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm"
              >
                {payoutMethods.map((method) => (
                  <option key={method._id} value={method._id}>
                    {method.type === 'upi' 
                      ? `UPI: ${method.displayInfo || method.upiId}` 
                      : `${method.bankName} ••••${method.accountNumber?.slice(-4)}`}
                    {method.isPrimary ? ' (Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl flex items-center gap-2 text-xs">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Funds transferred via Razorpay Payout within 24-48 hours.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsWithdrawModalOpen(false)} disabled={isProcessing}>
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

export default FreelancerEarningsPage;
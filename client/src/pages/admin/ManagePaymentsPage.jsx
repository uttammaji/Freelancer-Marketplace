// client/src/pages/admin/ManagePaymentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllPayments } from '../../services/payment.service';
import { getAllTransactions, getPlatformStats } from '../../services/transaction.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatters';
import { 
  DollarSign, 
  Shield, 
  CreditCard, 
  ArrowDownLeft,
  Loader2,
  Wallet,
} from 'lucide-react';

export function ManagePaymentsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 20;

  // Fetch all payment data
  const fetchPaymentData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [paymentsRes, transactionsRes, statsRes] = await Promise.all([
        getAllPayments(),
        getAllTransactions({ page: currentPage, limit: itemsPerPage }),
        getPlatformStats(),
      ]);

      if (paymentsRes.success) {
        setPayments(paymentsRes.payments || []);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.transactions || []);
        setTotalPages(transactionsRes.totalPages || 1);
        setTotalCount(transactionsRes.total || 0);
      }

      if (statsRes.success) {
        setPlatformStats(statsRes.stats);
      }
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      toast.error('Load Failed', 'Could not load payment information.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // Calculate real stats
  const totalVolume = platformStats?.totalVolume || 0;
  const totalTransactions = platformStats?.totalTransactions || 0;
  const platformRevenue = totalVolume * 0.05; // 5% fee
  const activeEscrow = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // Map transaction for card
  const mapTransaction = (tx) => ({
    id: tx._id,
    description: tx.description || '',
    projectTitle: tx.projectId?.title || '',
    amount: tx.amount,
    type: tx.type,
    status: tx.status,
    direction: tx.direction,
    date: tx.createdAt,
    paymentMethod: tx.direction === 'credit' ? 'Escrow Release' : 'Razorpay',
  });

  // Filter transactions by search
  const filteredTransactions = transactions.filter(tx => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(query) ||
      tx.userId?.name?.toLowerCase().includes(query) ||
      tx.projectId?.title?.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Financial Treasury</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Platform Payments & Escrow Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete audit trail of Razorpay deposits, platform fees, and escrow management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Platform GMV"
          value={formatCurrency(totalVolume)}
          change={`${totalTransactions} transactions`}
          isPositive={true}
          icon={CreditCard}
          color="emerald"
          subtitle="Total transacted volume"
        />
        <StatCard
          title="Platform Revenue (5%)"
          value={formatCurrency(platformRevenue)}
          change="Commission collected"
          isPositive={true}
          icon={DollarSign}
          color="purple"
          subtitle="From all payments"
        />
        <StatCard
          title="Active Escrow Balance"
          value={formatCurrency(activeEscrow)}
          icon={Shield}
          color="primary"
          subtitle="Held for active contracts"
        />
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Razorpay Payments</h2>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.slice(0, 10).map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60">
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                        {payment.orderId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {payment.clientId?.name || 'Client'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {payment.freelancerId?.name || 'Freelancer'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          payment.status === 'paid' ? 'success' :
                          payment.status === 'failed' ? 'danger' :
                          payment.status === 'refunded' ? 'danger' :
                          'warning'
                        } size="sm">
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Transaction Log</h2>
          <span className="text-xs text-slate-400">{totalCount} records</span>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search transactions..."
            size="sm"
          />
        </div>

        {filteredTransactions.length > 0 ? (
          <>
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <TransactionCard key={tx._id} tx={mapTransaction(tx)} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagePaymentsPage;
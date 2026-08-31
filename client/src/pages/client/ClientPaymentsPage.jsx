// client/src/pages/client/ClientPaymentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClientPayments } from '../../services/payment.service';
import { getMyTransactions, getTransactionStats } from '../../services/transaction.service';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { 
  formatCurrency, 
  formatDate,
  formatInvoiceNumber,
  formatPhoneNumber,
} from '../../utils/formatters';
import { 
  CreditCard, 
  Download, 
  Shield, 
  IndianRupee, 
  Loader2,
  Wallet,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Filter,
  Smartphone,
  Phone,
  AlertTriangle,
  Plus,
  Lock,
} from 'lucide-react';

export function ClientPaymentsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  // Fetch all payment data
  const fetchPaymentData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [paymentsRes, transactionsRes, statsRes] = await Promise.all([
        getClientPayments(),
        getMyTransactions({ limit: 50 }),
        getTransactionStats(),
      ]);

      if (paymentsRes.success) {
        setPayments(paymentsRes.payments || []);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.transactions || []);
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      toast.error('Load Failed', 'Could not load payment information.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // Calculate stats
  const totalSpent = stats?.totalDebits || 0;
  const successfulPayments = payments.filter(p => p.status === 'paid');
  const failedPayments = payments.filter(p => p.status === 'failed');
  const pendingPayments = payments.filter(p => p.status === 'created' || p.status === 'pending');
  const escrowAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const platformFees = Math.round(totalSpent * 0.05);
  const gstOnFees = Math.round(platformFees * 0.18);

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        p.projectId?.title?.toLowerCase().includes(query) ||
        p.orderId?.toLowerCase().includes(query) ||
        p.freelancerId?.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Map transaction with correct direction sign
  const mapTransaction = (tx) => ({
    id: tx._id,
    description: tx.description || '',
    projectTitle: tx.projectId?.title || '',
    amount: tx.amount,
    type: tx.type,
    status: tx.status,
    direction: tx.direction,
    date: tx.createdAt,
    signedAmount: tx.direction === 'debit' ? -tx.amount : tx.amount,
  });

  // Get status badge
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3" /> Paid</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3" /> Failed</Badge>;
      case 'refunded':
        return <Badge variant="danger" size="sm">Refunded</Badge>;
      default:
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3" /> {status}</Badge>;
    }
  };

  // Generate short invoice number from ObjectId
  const getShortInvoiceNumber = (id) => {
    if (!id) return 'N/A';
    // Use last 8 chars of ObjectId as invoice number
    const shortId = id.toString().slice(-8).toUpperCase();
    return `INV-2026-${shortId}`;
  };

  // Handle download invoice
  const handleDownloadInvoice = (payment) => {
    toast.info('Invoice Download', 'PDF invoice generation coming soon.');
  };

  // Loading state
  if (isLoading) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Financial Accounting</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Payments & Escrow Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track Razorpay payments, GST invoices, escrow deposits & transaction history
          </p>
        </div>

        <Button variant="outline" size="sm" icon={Download} onClick={() => toast.info('Coming Soon', 'Statement download will be available soon.')}>
          Download Statement
        </Button>
      </div>

      {/* Phone Verification Banner */}
      {!currentUser?.isPhoneVerified && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Phone Not Verified</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Verify your phone number to enable payments and withdrawals.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" icon={Phone} onClick={() => setIsPhoneModalOpen(true)}>
            Verify Now
          </Button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change={`${stats?.totalCount || 0} transactions`}
          isPositive={true}
          icon={IndianRupee}
          color="emerald"
          subtitle="Lifetime payments"
        />
        <StatCard
          title="In Escrow"
          value={formatCurrency(escrowAmount)}
          change={`${successfulPayments.length} active contracts`}
          isPositive={true}
          icon={Shield}
          color="primary"
          subtitle="Held securely"
        />
        <StatCard
          title="Platform Fees"
          value={formatCurrency(platformFees)}
          change={`GST: ${formatCurrency(gstOnFees)}`}
          isPositive={false}
          icon={Wallet}
          color="purple"
          subtitle="5% service fee + 18% GST"
        />
        <StatCard
          title="Successful Payments"
          value={successfulPayments.length}
          change={`${failedPayments.length} failed • ${pendingPayments.length} pending`}
          isPositive={successfulPayments.length > 0}
          icon={CheckCircle2}
          color="amber"
          subtitle="Razorpay transactions"
        />
      </div>

      {/* Payment Method Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Method</h3>
            <p className="text-xs text-slate-400 mt-0.5">Razorpay gateway for secure payments</p>
          </div>
          <Badge variant="success" size="sm">Active</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Razorpay Info */}
          <div className="p-4 rounded-2xl border-2 border-primary-500/40 bg-primary-50/20 dark:bg-primary-950/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-600 text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Razorpay Payment Gateway
              </span>
              <span className="text-[11px] text-slate-400">
                UPI, Cards, NetBanking, Wallets
              </span>
            </div>
          </div>

          {/* Phone Status */}
          <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
            currentUser?.isPhoneVerified 
              ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20' 
              : 'border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/20'
          }`}>
            <div className={`p-2.5 rounded-xl ${
              currentUser?.isPhoneVerified 
                ? 'bg-emerald-600 text-white' 
                : 'bg-amber-600 text-white'
            }`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {currentUser?.isPhoneVerified 
                  ? formatPhoneNumber(currentUser?.phone) 
                  : 'Phone Not Verified'}
              </span>
              <span className="text-[11px] text-slate-400">
                {currentUser?.isPhoneVerified ? 'Verified for payments' : 'Required for payments'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Search by project, order ID, or freelancer..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="created">Created</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length > 0 ? (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">GST (18%)</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedPayments.map((payment) => {
                    const gst = Math.round((payment.amount * 0.05) * 0.18);
                    return (
                      <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                          {getShortInvoiceNumber(payment._id)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[200px]">
                            {payment.projectId?.title || 'Project Payment'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {payment.orderId || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {payment.freelancerId?.name || 'Freelancer'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatCurrency(gst)}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {getPaymentStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadInvoice(payment)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {payment.paymentId && (
                              <a
                                href={`https://dashboard.razorpay.com/app/payments/${payment.paymentId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                                title="View on Razorpay"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Payments Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'No payments made yet.'}
          </p>
        </div>
      )}

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h2>
          <span className="text-xs text-slate-400">{transactions.length} records</span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
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
    </div>
  );
}

export default ClientPaymentsPage;
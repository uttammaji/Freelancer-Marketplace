// client/src/pages/client/ClientPaymentsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getClientPayments,
} from '../../services/payment.service';
import {
  getMyTransactions,
  getTransactionStats,
} from '../../services/transaction.service';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
} from '../../utils/formatters';
import {
  CreditCard,
  Download,
  Shield,
  IndianRupee,
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
  RefreshCw,
  Search,
  Receipt,
  RotateCcw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLATFORM_FEE_RATE = 0.05;
const GST_RATE = 0.18;
const ITEMS_PER_PAGE = 10;
const TRANSACTION_PREVIEW_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

const PAYMENT_STATUS = {
  paid:     { label: 'Paid',     variant: 'success', icon: CheckCircle2 },
  pending:  { label: 'Pending',  variant: 'warning', icon: Clock        },
  created:  { label: 'Created',  variant: 'warning', icon: Clock        },
  failed:   { label: 'Failed',   variant: 'danger',  icon: XCircle      },
  refunded: { label: 'Refunded', variant: 'info',    icon: RotateCcw    },
};

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Statuses' },
  { value: 'paid',     label: 'Paid' },
  { value: 'created',  label: 'Created' },
  { value: 'pending',  label: 'Pending' },
  { value: 'failed',   label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safeFormatCurrency = (v) => {
  const n = safeNumber(v);
  try {
    return formatCurrency(n);
  } catch {
    return `₹${n.toLocaleString('en-IN')}`;
  }
};

const safeFormatDate = (d) => {
  if (!d) return '—';
  try {
    return formatDate ? formatDate(d) : new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
};

const safeFormatPhone = (p) => {
  if (!p) return '';
  try {
    return formatPhoneNumber ? formatPhoneNumber(p) : p;
  } catch {
    return p;
  }
};

/**
 * Derive a stable invoice number from a payment ID.
 * Uses the last 8 chars of the ObjectId — same value every time.
 */
function makeInvoiceNumber(id) {
  if (!id) return 'N/A';
  const s = String(id);
  return `INV-${s.slice(-8).toUpperCase()}`;
}

/**
 * Break a payment amount into platform fee + GST.
 * IMPORTANT: `amount` is what the client paid (already includes fee + GST).
 * Fee is derived from the pre-fee base, not the paid total.
 */
function computeInvoiceBreakdown(amount) {
  const total = safeNumber(amount);

  // If total = base × (1 + fee%) × (1 + gst%)
  // Then base = total / ((1 + fee%) × (1 + gst%))
  const multiplier = (1 + PLATFORM_FEE_RATE) * (1 + GST_RATE);
  const base = Math.round(total / multiplier);
  const platformFee = Math.round(base * PLATFORM_FEE_RATE);
  const gst = Math.round(platformFee * GST_RATE);

  return { total, base, platformFee, gst };
}

const getStatusConfig = (status) =>
  PAYMENT_STATUS[status] || {
    label: status || 'Unknown',
    variant: 'default',
    icon: Clock,
  };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ClientPaymentsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  /* ---------- Data ---------- */
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);

  /* ---------- Filters & pagination ---------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ---------------- Reset page on filter change ---------------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  /* ---------------- Fetch ---------------- */
  const fetchPaymentData = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [paymentsRes, transactionsRes, statsRes] = await Promise.all([
          getClientPayments(),
          getMyTransactions({ limit: 50 }),
          getTransactionStats(),
        ]);

        if (paymentsRes?.success) setPayments(paymentsRes.payments || []);
        if (transactionsRes?.success)
          setTransactions(transactionsRes.transactions || []);
        if (statsRes?.success) setStats(statsRes.stats);

        if (silent) {
          toast.success('Refreshed', 'Payment data is up to date.');
        }
      } catch (error) {
        console.error('[ClientPayments] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          toast.error('Load Failed', 'Could not load payment information.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  /* ---------------- Derived stats ---------------- */
  const derived = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid');
    const failed = payments.filter((p) => p.status === 'failed');
    const pending = payments.filter(
      (p) => p.status === 'created' || p.status === 'pending'
    );

    const totalPaid = paid.reduce((sum, p) => sum + safeNumber(p.amount), 0);

    // Break down the paid total into base + fee + GST
    const breakdown = computeInvoiceBreakdown(totalPaid);

    return {
      totalPaid,
      platformFee: breakdown.platformFee,
      gst: breakdown.gst,
      successfulCount: paid.length,
      failedCount: failed.length,
      pendingCount: pending.length,
      totalCount: payments.length,
    };
  }, [payments]);

  /* ---------------- Filtered + paginated payments ---------------- */
  const filteredPayments = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return payments.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.projectId?.title?.toLowerCase().includes(q) ||
        p.orderId?.toLowerCase().includes(q) ||
        p.freelancerId?.name?.toLowerCase().includes(q) ||
        p.paymentId?.toLowerCase().includes(q)
      );
    });
  }, [payments, statusFilter, debouncedSearch]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE)),
    [filteredPayments.length]
  );

  const paginatedPayments = useMemo(
    () =>
      filteredPayments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredPayments, currentPage]
  );

  const hasActiveFilters =
    Boolean(debouncedSearch) || statusFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  /* ---------------- Map transaction ---------------- */
  const mapTransaction = useCallback(
    (tx) => ({
      id: tx._id,
      description: tx.description || '',
      projectTitle: tx.projectId?.title || '',
      amount: safeNumber(tx.amount),
      type: tx.type,
      status: tx.status,
      direction: tx.direction,
      date: tx.createdAt,
      signedAmount:
        tx.direction === 'debit'
          ? -safeNumber(tx.amount)
          : safeNumber(tx.amount),
    }),
    []
  );

  /* ---------------- Actions ---------------- */
  const handleDownloadInvoice = useCallback(
    (payment) => {
      toast.info(
        'Invoice Download',
        `Invoice ${makeInvoiceNumber(
          payment._id
        )} will be available as a PDF download soon.`
      );
    },
    [toast]
  );

  const handleDownloadStatement = useCallback(() => {
    toast.info('Coming Soon', 'Full account statement download will be available soon.');
  }, [toast]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading && payments.length === 0) {
    return <PaymentsSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && payments.length === 0 && transactions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load payments"
          description="We hit a snag reaching the payment service. Try again in a moment."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchPaymentData()}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  /* ---------------- Render: main ---------------- */
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">
            Financial Accounting
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Payments & Escrow Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Track Razorpay payments, GST invoices, escrow deposits & transaction history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchPaymentData({ silent: true })}
            disabled={isRefreshing}
            aria-label="Refresh payments"
            className={isRefreshing ? 'animate-pulse' : ''}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownloadStatement}
          >
            Download Statement
          </Button>
        </div>
      </header>

      {/* Phone verification banner */}
      {!currentUser?.isPhoneVerified && (
        <section
          aria-label="Phone verification required"
          className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Phone Not Verified
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-400 text-pretty">
                Verify your phone number to enable payments and withdrawals.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Phone}
            onClick={() => setIsPhoneModalOpen(true)}
            className="shrink-0 self-end sm:self-auto"
          >
            Verify Now
          </Button>
        </section>
      )}

      {/* Metric cards */}
      <section
        aria-label="Payment metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard
          title="Total Spent"
          value={safeFormatCurrency(derived.totalPaid)}
          change={`${derived.totalCount} transactions`}
          isPositive
          icon={IndianRupee}
          color="emerald"
          subtitle="Lifetime paid"
        />
        <StatCard
          title="In Escrow"
          value={safeFormatCurrency(derived.totalPaid)}
          change={`${derived.successfulCount} active contracts`}
          isPositive
          icon={Shield}
          color="primary"
          subtitle="Held securely"
        />
        <StatCard
          title="Platform Fees"
          value={safeFormatCurrency(derived.platformFee)}
          change={`GST: ${safeFormatCurrency(derived.gst)}`}
          isPositive={false}
          icon={Wallet}
          color="purple"
          subtitle={`${PLATFORM_FEE_RATE * 100}% fee + ${GST_RATE * 100}% GST`}
        />
        <StatCard
          title="Successful Payments"
          value={derived.successfulCount}
          change={`${derived.failedCount} failed • ${derived.pendingCount} pending`}
          isPositive={derived.successfulCount > 0}
          icon={CheckCircle2}
          color="amber"
          subtitle="Razorpay transactions"
        />
      </section>

      {/* Payment method card */}
      <section
        aria-label="Payment method"
        className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Payment Method
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Razorpay gateway for secure payments.
            </p>
          </div>
          <Badge variant="success" size="sm">
            Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MethodTile
            icon={CreditCard}
            title="Razorpay Payment Gateway"
            subtitle="UPI, Cards, NetBanking, Wallets"
            tone="primary"
          />

          <MethodTile
            icon={Smartphone}
            title={
              currentUser?.isPhoneVerified
                ? safeFormatPhone(currentUser?.phone)
                : 'Phone Not Verified'
            }
            subtitle={
              currentUser?.isPhoneVerified
                ? 'Verified for payments'
                : 'Required for payments'
            }
            tone={currentUser?.isPhoneVerified ? 'success' : 'warning'}
          />
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 sm:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project, order ID, or freelancer…"
            aria-label="Search payments"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter
            className="w-4 h-4 text-slate-400 shrink-0"
            aria-hidden="true"
          />
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                       cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments table */}
      {filteredPayments.length > 0 ? (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Client payment invoices with GST breakdown and status
                </caption>
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">Invoice</th>
                    <th scope="col" className="px-6 py-4">Project</th>
                    <th scope="col" className="px-6 py-4">Freelancer</th>
                    <th scope="col" className="px-6 py-4 text-right">Amount</th>
                    <th scope="col" className="px-6 py-4 text-right">GST (18%)</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">
                      <span className="sr-only">Actions</span>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedPayments.map((payment) => {
                    const breakdown = computeInvoiceBreakdown(payment.amount);
                    const statusConfig = getStatusConfig(payment.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={payment._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {makeInvoiceNumber(payment._id)}
                        </td>

                        <td className="px-6 py-4 max-w-[220px]">
                          <div
                            className="font-bold text-slate-900 dark:text-white truncate"
                            title={payment.projectId?.title}
                          >
                            {payment.projectId?.title || 'Project Payment'}
                          </div>
                          <div
                            className="text-[11px] text-slate-400 font-mono truncate"
                            title={payment.orderId}
                          >
                            {payment.orderId || 'N/A'}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                          {payment.freelancerId?.name || 'Freelancer'}
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-right tabular-nums whitespace-nowrap">
                          {safeFormatCurrency(payment.amount)}
                        </td>

                        <td className="px-6 py-4 text-slate-500 text-right tabular-nums whitespace-nowrap">
                          {safeFormatCurrency(breakdown.gst)}
                        </td>

                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          {safeFormatDate(payment.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={statusConfig.variant} size="sm">
                            <StatusIcon className="w-3 h-3" aria-hidden="true" />
                            {statusConfig.label}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(payment)}
                              className="p-1.5 rounded-lg text-slate-400
                                         hover:text-primary-600 dark:hover:text-primary-400
                                         hover:bg-primary-50 dark:hover:bg-primary-950/40
                                         transition-colors
                                         focus:outline-none focus-visible:ring-2
                                         focus-visible:ring-primary-500"
                              aria-label={`Download invoice ${makeInvoiceNumber(payment._id)}`}
                              title="Download invoice"
                            >
                              <Download className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>

                            {payment.paymentId && (
                              <a
                                href={`https://dashboard.razorpay.com/app/payments/${payment.paymentId}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="p-1.5 rounded-lg text-slate-400
                                           hover:text-primary-600 dark:hover:text-primary-400
                                           hover:bg-primary-50 dark:hover:bg-primary-950/40
                                           transition-colors
                                           focus:outline-none focus-visible:ring-2
                                           focus-visible:ring-primary-500"
                                aria-label="View payment on Razorpay"
                                title="View on Razorpay"
                              >
                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
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

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Payments pagination"
            />
          )}
        </>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments yet"
          description="Once you hire a freelancer and fund escrow, your payment history will appear here."
          action={
            <Link to="/dashboard/client/projects">
              <Button variant="primary" size="sm">
                View My Projects
              </Button>
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={Search}
          title="No matching payments"
          description="Nothing matched your current filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {/* Transaction history */}
      <section aria-label="Transaction history" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <span className="text-xs text-slate-400 tabular-nums">
            {transactions.length.toLocaleString()} record
            {transactions.length === 1 ? '' : 's'}
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions
              .slice(0, TRANSACTION_PREVIEW_LIMIT)
              .map((tx) => (
                <TransactionCard key={tx._id} tx={mapTransaction(tx)} />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={IndianRupee}
            title="No transactions yet"
            description="Payments, refunds, and payouts will appear here."
          />
        )}
      </section>

      {/* Phone verification modal */}
      {isPhoneModalOpen && (
        <PhoneVerificationModal
          onClose={() => setIsPhoneModalOpen(false)}
          phone={currentUser?.phone}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function MethodTile({ icon: Icon, title, subtitle, tone = 'primary' }) {
  const tones = {
    primary: {
      border: 'border-primary-500/40 bg-primary-50/20 dark:bg-primary-950/20',
      badge: 'bg-primary-600 text-white',
      text: '',
    },
    success: {
      border: 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20',
      badge: 'bg-emerald-600 text-white',
      text: '',
    },
    warning: {
      border: 'border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/20',
      badge: 'bg-amber-600 text-white',
      text: '',
    },
  };
  const t = tones[tone] || tones.primary;

  return (
    <div className={`p-4 rounded-2xl border-2 ${t.border} flex items-center gap-3`}>
      <div className={`p-2.5 rounded-xl ${t.badge} shrink-0`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
          {title}
        </span>
        <span className="text-[11px] text-slate-400 truncate block">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function PhoneVerificationModal({ onClose, phone }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-verify-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-soft-lg space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto">
            <Phone className="w-7 h-7 text-amber-600" aria-hidden="true" />
          </div>
          <h3
            id="phone-verify-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Verify Phone Number
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-pretty">
            {phone
              ? `We'll send an OTP to ${safeFormatPhone(phone)}.`
              : 'Add a phone number to your account before verifying.'}
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Link
            to="/dashboard/client/settings"
            className="flex-1"
            onClick={onClose}
          >
            <Button variant="primary" className="w-full">
              Go to Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default ClientPaymentsPage;
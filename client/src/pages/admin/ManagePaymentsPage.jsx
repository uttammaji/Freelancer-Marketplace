// client/src/pages/admin/ManagePaymentsPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useToast } from '../../context/ToastContext';
import { getAllPayments } from '../../services/payment.service';
import {
  getAllTransactions,
  getPlatformStats,
} from '../../services/transaction.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { TransactionCard } from '../../components/cards/TransactionCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  DollarSign,
  Shield,
  CreditCard,
  Loader2,
  Wallet,
  RefreshCw,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLATFORM_FEE_RATE = 0.05;
const ITEMS_PER_PAGE = 20;
const RECENT_PAYMENTS_LIMIT = 10;

/** Status → badge variant mapping (single source of truth). */
const PAYMENT_STATUS_VARIANT = {
  paid: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'danger',
  refunded: 'danger',
  cancelled: 'default',
};

/** Status → small icon for the pill. */
const PAYMENT_STATUS_ICON = {
  paid: CheckCircle2,
  pending: Clock,
  processing: Clock,
  failed: XCircle,
  refunded: RotateCcw,
  cancelled: XCircle,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeFormatCurrency = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
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

const getPaymentStatusVariant = (status) =>
  PAYMENT_STATUS_VARIANT[status] || 'default';

const getPaymentStatusIcon = (status) =>
  PAYMENT_STATUS_ICON[status] || Clock;

const shortenId = (id, head = 8, tail = 6) => {
  if (!id || typeof id !== 'string') return 'N/A';
  if (id.length <= head + tail + 3) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ManagePaymentsPage() {
  const toast = useToast();

  /* ---------- Data ---------- */
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);

  /* ---------- Pagination / filter ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all'); // all | credit | debit

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------------- Search debounce ---------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchPaymentData = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [paymentsRes, transactionsRes, statsRes] = await Promise.all([
          getAllPayments(),
          getAllTransactions({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
          }),
          getPlatformStats(),
        ]);

        if (paymentsRes?.success) {
          setPayments(paymentsRes.payments || []);
        }

        if (transactionsRes?.success) {
          setTransactions(transactionsRes.transactions || []);
          setTotalPages(transactionsRes.totalPages || 1);
          setTotalCount(transactionsRes.total || 0);
        } else {
          throw new Error(transactionsRes?.message || 'Failed to load transactions');
        }

        if (statsRes?.success) {
          setPlatformStats(statsRes.stats);
        }

        if (silent) {
          toast.success('Refreshed', 'Payment ledger is up to date.');
        }
      } catch (error) {
        console.error('[ManagePayments] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          toast.error('Load Failed', 'Could not load payment information.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, toast]
  );

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  /* ---------------- Derived stats ---------------- */
  const derived = useMemo(() => {
    const totalVolume = Number(platformStats?.totalVolume) || 0;
    const totalTransactions =
      Number(platformStats?.totalTransactions) || 0;
    const platformRevenue = Math.round(totalVolume * PLATFORM_FEE_RATE);
    const activeEscrow = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return { totalVolume, totalTransactions, platformRevenue, activeEscrow };
  }, [platformStats, payments]);

  /* ---------------- Filtered transactions ---------------- */
  const filteredTransactions = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (txTypeFilter !== 'all' && tx.direction !== txTypeFilter) return false;
      if (!q) return true;
      return (
        tx.description?.toLowerCase().includes(q) ||
        tx.userId?.name?.toLowerCase().includes(q) ||
        tx.projectId?.title?.toLowerCase().includes(q)
      );
    });
  }, [transactions, debouncedSearch, txTypeFilter]);

  /* ---------------- Map for card ---------------- */
  const mapTransaction = useCallback(
    (tx) => ({
      id: tx._id,
      description: tx.description || '',
      projectTitle: tx.projectId?.title || '',
      amount: tx.amount,
      type: tx.type,
      status: tx.status,
      direction: tx.direction,
      date: tx.createdAt,
      paymentMethod: tx.direction === 'credit' ? 'Escrow Release' : 'Razorpay',
    }),
    []
  );

  const hasActiveFilters = debouncedSearch || txTypeFilter !== 'all';

  /* ---------------- Render: loading ---------------- */
  if (isLoading && transactions.length === 0) {
    return <PaymentsSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && transactions.length === 0 && payments.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load payment ledger"
          description="We hit a snag reaching the treasury service. Try again in a moment."
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
          <Badge variant="purple" size="sm" className="mb-2">
            Financial Treasury
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Platform Payments & Escrow Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Complete audit trail of Razorpay deposits, platform fees, and escrow management.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => fetchPaymentData({ silent: true })}
          disabled={isRefreshing}
          aria-label="Refresh payment data"
          className={isRefreshing ? 'animate-pulse' : ''}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      {/* Stats */}
      <section
        aria-label="Payment metrics"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <StatCard
          title="Total Platform GMV"
          value={safeFormatCurrency(derived.totalVolume)}
          change={`${derived.totalTransactions.toLocaleString()} transactions`}
          isPositive
          icon={CreditCard}
          color="emerald"
          subtitle="Total transacted volume"
        />
        <StatCard
          title={`Platform Revenue (${PLATFORM_FEE_RATE * 100}%)`}
          value={safeFormatCurrency(derived.platformRevenue)}
          change="Commission collected"
          isPositive
          icon={DollarSign}
          color="purple"
          subtitle="From all payments"
        />
        <StatCard
          title="Active Escrow Balance"
          value={safeFormatCurrency(derived.activeEscrow)}
          icon={Shield}
          color="primary"
          subtitle="Held for active contracts"
        />
      </section>

      {/* Recent Payments Table */}
      {payments.length > 0 && (
        <section aria-label="Recent Razorpay payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Razorpay Payments
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">
              Showing {Math.min(payments.length, RECENT_PAYMENTS_LIMIT)} of {payments.length}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  Recent Razorpay payment records
                </caption>
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">Order ID</th>
                    <th scope="col" className="px-6 py-4">Client</th>
                    <th scope="col" className="px-6 py-4">Freelancer</th>
                    <th scope="col" className="px-6 py-4 text-right">Amount</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.slice(0, RECENT_PAYMENTS_LIMIT).map((payment) => {
                    const StatusIcon = getPaymentStatusIcon(payment.status);
                    return (
                      <tr
                        key={payment._id || payment.orderId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors"
                      >
                        <td
                          className="px-6 py-4 font-mono text-[11px] text-slate-500"
                          title={payment.orderId || ''}
                        >
                          {shortenId(payment.orderId)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                          {payment.clientId?.name || 'Client'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                          {payment.freelancerId?.name || 'Freelancer'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-right tabular-nums whitespace-nowrap">
                          {safeFormatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={getPaymentStatusVariant(payment.status)}
                            size="sm"
                          >
                            <StatusIcon className="w-3 h-3" aria-hidden="true" />
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          {safeFormatDate(payment.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Transaction Log */}
      <section aria-label="Platform transaction log" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Platform Transaction Log
          </h2>
          <span className="text-xs text-slate-400 tabular-nums">
            {totalCount.toLocaleString()} record{totalCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, user, or project…"
              aria-label="Search transactions"
            />
          </div>

          <div
            className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900 self-start"
            role="tablist"
            aria-label="Filter by direction"
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'credit', label: 'Credits' },
              { id: 'debit', label: 'Debits' },
            ].map((tab) => {
              const isActive = txTypeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTxTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {filteredTransactions.length > 0 ? (
          <>
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <TransactionCard key={tx._id} tx={mapTransaction(tx)} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                aria-label="Transactions pagination"
              />
            )}
          </>
        ) : hasActiveFilters ? (
          <EmptyState
            icon={Search}
            title="No matching transactions"
            description="Nothing matched your current filters."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setTxTypeFilter('all');
                  setCurrentPage(1);
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Wallet}
            title="No transactions yet"
            description="Transactions will appear here as soon as payments start flowing."
          />
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function PaymentsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default ManagePaymentsPage;
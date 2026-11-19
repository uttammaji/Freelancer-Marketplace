// client/src/pages/freelancer/FreelancerContractsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getFreelancerContracts } from '../../services/contract.service';
import { ContractCard } from '../../components/cards/ContractCard';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import {
  FileCheck2,
  RefreshCw,
  AlertCircle,
  Search,
  IndianRupee,
  Clock,
  CheckCircle2,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const STATUS_GROUPS = {
  in_progress: [
    'pending_payment',
    'active',
    'submitted',
    'revision_requested',
  ],
  completed: ['completed'],
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatINR = (v) => CURRENCY_FORMATTER.format(safeNumber(v));

/**
 * Normalise a contract from the API into the shape `<ContractCard />` expects.
 * Field mapping is centralised so a single backend change updates one place.
 */
function mapContractToCard(contract) {
  const amount = safeNumber(contract.amount);

  return {
    id: contract._id || contract.id,

    // Project
    projectTitle: contract.projectId?.title || 'Untitled Project',

    // Client (freelancer view)
    clientName: contract.clientId?.name || 'Client',
    clientAvatar: contract.clientId?.avatar || '',
    clientId: contract.clientId,

    // Amounts — the improved ContractCard reads these names
    amount,
    escrowBalance: safeNumber(contract.escrowBalance ?? amount),
    freelancerAmount: safeNumber(contract.freelancerAmount ?? amount),

    // Dates
    startDate: contract.startDate,
    deadline: contract.deadline || contract.endDate,
    createdAt: contract.createdAt,

    // Status
    status: contract.status || 'active',
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function FreelancerContractsPage() {
  const toast = useToast();

  /* ---------- Data ---------- */
  const [contracts, setContracts] = useState([]);

  /* ---------- Filters ---------- */
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchContracts = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const response = await getFreelancerContracts();

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to load contracts');
        }

        setContracts(response.contracts || []);

        if (silent) {
          toast.success('Refreshed', 'Your contracts are up to date.');
        }
      } catch (error) {
        console.error('[FreelancerContracts] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setContracts([]);
          toast.error('Load Failed', 'Could not load your contracts.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  /* ---------------- Counts per tab ---------------- */
  const counts = useMemo(() => {
    const inProgress = contracts.filter((c) =>
      STATUS_GROUPS.in_progress.includes(c.status)
    ).length;
    const completed = contracts.filter((c) =>
      STATUS_GROUPS.completed.includes(c.status)
    ).length;

    return {
      all: contracts.length,
      inProgress,
      completed,
    };
  }, [contracts]);

  /* ---------------- Earnings summary ---------------- */
  const summary = useMemo(() => {
    const active = contracts.filter((c) =>
      STATUS_GROUPS.in_progress.includes(c.status)
    );

    const inEscrow = active.reduce(
      (sum, c) => sum + safeNumber(c.escrowBalance ?? c.amount),
      0
    );

    const totalEarned = contracts
      .filter((c) => c.status === 'completed')
      .reduce(
        (sum, c) => sum + safeNumber(c.freelancerAmount ?? c.amount),
        0
      );

    const pendingPayout = active
      .filter((c) => c.status === 'submitted')
      .reduce(
        (sum, c) => sum + safeNumber(c.freelancerAmount ?? c.amount),
        0
      );

    return {
      activeCount: active.length,
      inEscrow,
      totalEarned,
      pendingPayout,
    };
  }, [contracts]);

  /* ---------------- Filtered list ---------------- */
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return contracts.filter((c) => {
      // Tab filter
      if (
        activeTab === 'in_progress' &&
        !STATUS_GROUPS.in_progress.includes(c.status)
      ) {
        return false;
      }
      if (
        activeTab === 'completed' &&
        !STATUS_GROUPS.completed.includes(c.status)
      ) {
        return false;
      }

      // Search filter
      if (!q) return true;
      return (
        c.projectId?.title?.toLowerCase().includes(q) ||
        c.clientId?.name?.toLowerCase().includes(q) ||
        c.clientId?.email?.toLowerCase().includes(q)
      );
    });
  }, [contracts, activeTab, debouncedSearch]);

  const hasActiveFilters = Boolean(debouncedSearch);

  /* ---------------- Tabs config ---------------- */
  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All', badge: counts.all },
      { id: 'in_progress', label: 'Active', badge: counts.inProgress },
      { id: 'completed', label: 'Completed', badge: counts.completed },
    ],
    [counts]
  );

  /* ---------------- Render: loading ---------------- */
  if (isLoading && contracts.length === 0) {
    return <ContractsSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && contracts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load contracts"
          description="We hit a snag reaching the contract service. Try again in a moment."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchContracts()}
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
            Active Workspaces
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Contracts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Submit milestone deliverables, track escrow balances, and manage active client projects.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => fetchContracts({ silent: true })}
          disabled={isRefreshing}
          aria-label="Refresh contracts"
          className={isRefreshing ? 'animate-pulse' : ''}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      {/* Summary */}
      {contracts.length > 0 && (
        <section
          aria-label="Earnings summary"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <SummaryTile
            icon={Clock}
            label="Active Contracts"
            value={summary.activeCount.toLocaleString()}
            tint="text-amber-600 dark:text-amber-400"
          />
          <SummaryTile
            icon={IndianRupee}
            label="In Escrow"
            value={formatINR(summary.inEscrow)}
            tint="text-primary-600 dark:text-primary-400"
            highlight
          />
          <SummaryTile
            icon={TrendingUp}
            label="Total Earned"
            value={formatINR(summary.totalEarned)}
            tint="text-emerald-600 dark:text-emerald-400"
          />
        </section>
      )}

      {/* Tabs + search */}
      {contracts.length > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="pills"
            />
          </div>

          <div className="w-full lg:max-w-xs">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or clients…"
              aria-label="Search contracts"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {contracts.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No contracts yet"
          description="When a client accepts your proposal, the contract workspace will appear here."
          action={
            <Link to="/projects">
              <Button variant="primary" size="md" icon={Briefcase}>
                Find Work
              </Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching contracts"
          description={
            hasActiveFilters
              ? `No contracts match "${debouncedSearch}".`
              : 'No contracts in this tab yet.'
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch('')}
              >
                Clear search
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                View all contracts
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={mapContractToCard(contract)}
              role="freelancer"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function SummaryTile({ icon: Icon, label, value, tint, highlight = false }) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-colors ${
        highlight
          ? 'border-primary-200 dark:border-primary-900/60 bg-primary-50/40 dark:bg-primary-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${tint}`} aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <div className={`text-xl font-extrabold tabular-nums ${tint}`}>
        {value}
      </div>
    </div>
  );
}

function ContractsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

export default FreelancerContractsPage;
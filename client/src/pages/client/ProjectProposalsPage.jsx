// client/src/pages/client/ProjectProposalsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getProjectById } from '../../services/project.service';
import {
  getProjectProposals,
  shortlistProposal,
  acceptProposal,
  rejectProposal,
} from '../../services/proposal.service';
import { ProposalCard } from '../../components/cards/ProposalCard';
import { HireFreelancerModal } from '../../components/project/HireFreelancerModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  IndianRupee,
  Clock,
  TrendingUp,
  Star,
  XCircle,
  Bookmark,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PROPOSAL_STATUSES = {
  pending:     { label: 'Pending',     variant: 'warning'  },
  shortlisted: { label: 'Shortlisted', variant: 'primary'  },
  accepted:    { label: 'Hired',       variant: 'success'  },
  rejected:    { label: 'Rejected',    variant: 'danger'   },
};

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Most Recent' },
  { value: 'bid_asc',    label: 'Lowest Bid' },
  { value: 'bid_desc',   label: 'Highest Bid' },
  { value: 'fastest',    label: 'Fastest Delivery' },
  { value: 'rating',     label: 'Highest Rated' },
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

const getStatusConfig = (status) =>
  PROPOSAL_STATUSES[status] || { label: status || 'Unknown', variant: 'default' };

/**
 * Normalise proposal → shape ProposalCard expects.
 * Single source of truth for field mapping.
 */
function mapProposalToCard(p) {
  return {
    id: p._id,
    freelancerName: p.freelancerId?.name || 'Freelancer',
    freelancerAvatar: p.freelancerId?.avatar || '',
    freelancerEmail: p.freelancerId?.email || '',
    freelancerRating: safeNumber(p.freelancerId?.rating?.average || p.freelancerId?.rating),
    freelancerReviewsCount: safeNumber(p.freelancerId?.rating?.count),
    freelancerTitle: p.freelancerId?.title || p.freelancerId?.headline || '',
    coverLetter: p.coverLetter || '',
    bidAmount: safeNumber(p.bidAmount),
    deliveryDays: safeNumber(p.deliveryDays),
    status: p.status || 'pending',
    createdAt: p.createdAt,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ProjectProposalsPage() {
  const { id } = useParams();
  const toast = useToast();

  /* ---------- Data ---------- */
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);

  /* ---------- Filters & sort ---------- */
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Actions ---------- */
  const [selectedProposalForHire, setSelectedProposalForHire] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;

      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [projectRes, proposalsRes] = await Promise.all([
          getProjectById(id),
          getProjectProposals(id),
        ]);

        if (!projectRes?.success) {
          throw new Error(projectRes?.message || 'Project not found');
        }

        setProject(projectRes.project);
        setProposals(proposalsRes?.success ? proposalsRes.proposals || [] : []);

        if (silent) {
          toast.success('Refreshed', 'Proposals are up to date.');
        }
      } catch (error) {
        console.error('[ProjectProposals] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setProject(null);
          setProposals([]);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [id, toast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------- Derived: counts ---------------- */
  const counts = useMemo(
    () => ({
      all: proposals.length,
      pending: proposals.filter((p) => p.status === 'pending').length,
      shortlisted: proposals.filter((p) => p.status === 'shortlisted').length,
      accepted: proposals.filter((p) => p.status === 'accepted').length,
      rejected: proposals.filter((p) => p.status === 'rejected').length,
    }),
    [proposals]
  );

  /* ---------------- Derived: analytics ---------------- */
  const analytics = useMemo(() => {
    if (proposals.length === 0) {
      return { lowestBid: 0, highestBid: 0, avgBid: 0, avgDelivery: 0 };
    }
    const bids = proposals.map((p) => safeNumber(p.bidAmount)).filter(Boolean);
    const days = proposals.map((p) => safeNumber(p.deliveryDays)).filter(Boolean);

    return {
      lowestBid: bids.length ? Math.min(...bids) : 0,
      highestBid: bids.length ? Math.max(...bids) : 0,
      avgBid: bids.length
        ? Math.round(bids.reduce((s, b) => s + b, 0) / bids.length)
        : 0,
      avgDelivery: days.length
        ? Math.round(days.reduce((s, d) => s + d, 0) / days.length)
        : 0,
    };
  }, [proposals]);

  /* ---------------- Derived: filtered & sorted ---------------- */
  const visibleProposals = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    let list = proposals.filter((p) => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (!q) return true;
      return (
        p.freelancerId?.name?.toLowerCase().includes(q) ||
        p.coverLetter?.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'bid_asc':
          return safeNumber(a.bidAmount) - safeNumber(b.bidAmount);
        case 'bid_desc':
          return safeNumber(b.bidAmount) - safeNumber(a.bidAmount);
        case 'fastest':
          return safeNumber(a.deliveryDays) - safeNumber(b.deliveryDays);
        case 'rating': {
          const ra = safeNumber(a.freelancerId?.rating?.average || a.freelancerId?.rating);
          const rb = safeNumber(b.freelancerId?.rating?.average || b.freelancerId?.rating);
          return rb - ra;
        }
        case 'recent':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return list;
  }, [proposals, filterStatus, debouncedSearch, sortBy]);

  const hasActiveFilters = Boolean(debouncedSearch) || filterStatus !== 'all';

  const clearFilters = useCallback(() => {
    setSearch('');
    setFilterStatus('all');
  }, []);

  /* ---------------- Processing helper ---------------- */
  const markProcessing = useCallback((proposalId, isProcessing) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (isProcessing) next.add(proposalId);
      else next.delete(proposalId);
      return next;
    });
  }, []);

  /* ---------------- Actions ---------------- */
  const handleShortlist = useCallback(
    async (proposalId) => {
      markProcessing(proposalId, true);
      const snapshot = proposals;

      // Optimistic
      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposalId ? { ...p, status: 'shortlisted' } : p
        )
      );

      try {
        const response = await shortlistProposal(proposalId);
        if (!response?.success) throw new Error(response?.message);

        toast.success('Shortlisted', 'Freelancer marked as shortlisted.');
      } catch (error) {
        console.error('[ProjectProposals] shortlist failed:', error);
        setProposals(snapshot);
        toast.error(
          'Action Failed',
          error?.response?.data?.message ||
            error?.message ||
            'Could not shortlist proposal.'
        );
      } finally {
        markProcessing(proposalId, false);
      }
    },
    [proposals, toast, markProcessing]
  );

  const requestReject = useCallback((proposalId) => {
    const target = proposals.find((p) => p._id === proposalId);
    if (target) setConfirmReject(target);
  }, [proposals]);

  const confirmRejectAction = useCallback(async () => {
    if (!confirmReject) return;

    const proposalId = confirmReject._id;
    const snapshot = proposals;

    setConfirmReject(null);
    markProcessing(proposalId, true);

    // Optimistic
    setProposals((prev) =>
      prev.map((p) =>
        p._id === proposalId ? { ...p, status: 'rejected' } : p
      )
    );

    try {
      const response = await rejectProposal(proposalId);
      if (!response?.success) throw new Error(response?.message);

      toast.success('Declined', 'Proposal has been declined.');
    } catch (error) {
      console.error('[ProjectProposals] reject failed:', error);
      setProposals(snapshot);
      toast.error(
        'Action Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Could not reject proposal.'
      );
    } finally {
      markProcessing(proposalId, false);
    }
  }, [confirmReject, proposals, toast, markProcessing]);

  const handleHireConfirmed = useCallback(async () => {
    setSelectedProposalForHire(null);
    await fetchData({ silent: true });
    toast.success('Freelancer Hired!', 'Contract workspace has been created.');
  }, [fetchData, toast]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading && !project) {
    return <ProposalsSkeleton />;
  }

  /* ---------------- Render: not found / error ---------------- */
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Project not found"
          description={
            loadError?.message ||
            "We couldn't find this project. It may have been removed."
          }
          action={
            <Link to="/dashboard/client/projects">
              <Button variant="primary" size="sm" icon={ArrowLeft}>
                Back to My Projects
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------------- Render: main ---------------- */
  return (
    <div className="space-y-8 pb-12">
      {/* Back link */}
      <Link
        to="/dashboard/client/projects"
        className="inline-flex items-center gap-1.5 text-xs font-bold
                   text-slate-500 hover:text-slate-900
                   dark:text-slate-400 dark:hover:text-white
                   transition-colors focus:outline-none focus-visible:ring-2
                   focus-visible:ring-primary-500 rounded px-1"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to My Projects
      </Link>

      {/* Header card */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="sm">
              {project.categoryId?.name || 'General'}
            </Badge>
            <span className="text-xs text-slate-400 tabular-nums">
              Budget: {safeFormatCurrency(project.budget?.min)}
              {safeNumber(project.budget?.max) > safeNumber(project.budget?.min) && (
                <> – {safeFormatCurrency(project.budget.max)}</>
              )}
            </span>
          </div>

          <h1
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-pretty"
            title={project.title}
          >
            {project.title}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reviewing{' '}
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {proposals.length}
            </span>{' '}
            proposal{proposals.length === 1 ? '' : 's'} from interested freelancers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchData({ silent: true })}
            disabled={isRefreshing}
            aria-label="Refresh proposals"
            className={isRefreshing ? 'animate-pulse' : ''}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Link to={`/projects/${project._id}`}>
            <Button variant="outline" size="sm">
              View Job Post
            </Button>
          </Link>
        </div>
      </header>

      {/* Analytics strip */}
      {proposals.length > 0 && (
        <section
          aria-label="Proposal insights"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <InsightTile
            icon={IndianRupee}
            label="Lowest Bid"
            value={safeFormatCurrency(analytics.lowestBid)}
            tint="text-emerald-600 dark:text-emerald-400"
          />
          <InsightTile
            icon={TrendingUp}
            label="Average Bid"
            value={safeFormatCurrency(analytics.avgBid)}
            tint="text-primary-600 dark:text-primary-400"
          />
          <InsightTile
            icon={IndianRupee}
            label="Highest Bid"
            value={safeFormatCurrency(analytics.highestBid)}
            tint="text-amber-600 dark:text-amber-400"
          />
          <InsightTile
            icon={Clock}
            label="Avg Delivery"
            value={`${analytics.avgDelivery} day${analytics.avgDelivery === 1 ? '' : 's'}`}
            tint="text-slate-900 dark:text-white"
          />
        </section>
      )}

      {/* Filter + sort toolbar */}
      {proposals.length > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Status tabs */}
          <div
            className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-850/60 overflow-x-auto"
            role="tablist"
            aria-label="Filter proposals by status"
          >
            {[
              { id: 'all', label: 'All Bids', count: counts.all },
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
              { id: 'accepted', label: 'Hired', count: counts.accepted },
              { id: 'rejected', label: 'Rejected', count: counts.rejected },
            ].map((tab) => {
              const isActive = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 tabular-nums ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + sort */}
          <div className="flex flex-1 items-center gap-2 lg:max-w-md ml-auto">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or cover letter…"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Search proposals"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
              aria-label="Sort proposals"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {proposals.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No proposals yet"
          description="Once freelancers submit proposals, they'll appear here for you to review, shortlist, and hire."
          action={
            <Link to={`/projects/${project._id}`}>
              <Button variant="outline" size="sm">
                View Public Post
              </Button>
            </Link>
          }
        />
      ) : visibleProposals.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching proposals"
          description={
            hasActiveFilters
              ? `No proposals match your current filters.`
              : 'No proposals in this tab.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                View all proposals
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Result count */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">
              Showing {visibleProposals.length} of {proposals.length} proposal
              {proposals.length === 1 ? '' : 's'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="space-y-4">
            {visibleProposals.map((proposal) => {
              const isProcessing = processingIds.has(proposal._id);
              return (
                <ProposalCard
                  key={proposal._id}
                  proposal={mapProposalToCard(proposal)}
                  onShortlist={() => handleShortlist(proposal._id)}
                  onReject={() => requestReject(proposal._id)}
                  onHire={() => setSelectedProposalForHire(proposal)}
                  isClientView
                  isProcessing={isProcessing}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Hire modal */}
      {selectedProposalForHire && (
        <HireFreelancerModal
          isOpen
          onClose={() => setSelectedProposalForHire(null)}
          proposal={{
            id: selectedProposalForHire._id,
            freelancerName: selectedProposalForHire.freelancerId?.name || 'Freelancer',
            freelancerAvatar: selectedProposalForHire.freelancerId?.avatar || '',
            coverLetter: selectedProposalForHire.coverLetter,
            bidAmount: safeNumber(selectedProposalForHire.bidAmount),
            deliveryDays: safeNumber(selectedProposalForHire.deliveryDays),
          }}
          project={{
            id: project._id,
            title: project.title,
            budget: safeNumber(project.budget?.min),
            budgetMax: safeNumber(project.budget?.max),
          }}
          onHireConfirmed={handleHireConfirmed}
          onAccept={(proposalId) => acceptProposal(proposalId)}
        />
      )}

      {/* Reject confirmation */}
      <ConfirmDialog
        isOpen={!!confirmReject}
        onClose={() => setConfirmReject(null)}
        onConfirm={confirmRejectAction}
        title="Decline this proposal?"
        description={
          confirmReject
            ? `The proposal from ${
                confirmReject.freelancerId?.name || 'this freelancer'
              } will be marked as declined. They will be notified and won't be able to submit another bid for this project.`
            : ''
        }
        confirmLabel="Decline Proposal"
        cancelLabel="Keep Bidding"
        variant="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function InsightTile({ icon: Icon, label, value, tint }) {
  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${tint}`} aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className={`text-sm font-extrabold tabular-nums ${tint}`}>
        {value}
      </div>
    </div>
  );
}

function ProposalsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default ProjectProposalsPage;
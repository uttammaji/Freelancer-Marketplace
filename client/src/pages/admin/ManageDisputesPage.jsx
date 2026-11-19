// client/src/pages/admin/ManageDisputesPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useToast } from '../../context/ToastContext';
import {
  getAllDisputes,
  resolveDispute,
  getDisputeStats,
} from '../../services/dispute.service';
import { DisputeCard } from '../../components/cards/DisputeCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Textarea } from '../../components/common/Textarea';
import { formatCurrency } from '../../utils/formatters';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  IndianRupee,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ITEMS_PER_PAGE = 10;
const MIN_NOTE_LENGTH = 10;
const MAX_NOTE_LENGTH = 500;

const RESOLUTION_OPTIONS = [
  {
    value: 'release_payment',
    label: 'Release Payment to Freelancer',
    description: 'Full escrow amount is released. Freelancer receives payout.',
    variant: 'success',
  },
  {
    value: 'refund_client',
    label: 'Refund Client',
    description: 'Full escrow amount is returned to the client.',
    variant: 'danger',
  },
  {
    value: 'partial_refund',
    label: 'Split / Partial Refund',
    description: 'Escrow is divided between client and freelancer.',
    variant: 'warning',
  },
  {
    value: 'no_action',
    label: 'No Action Needed',
    description: 'Dispute is dismissed without moving funds.',
    variant: 'default',
  },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ManageDisputesPage() {
  const toast = useToast();

  /* ---------- List state ---------- */
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- UI state ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Resolution state ---------- */
  const [activeDispute, setActiveDispute] = useState(null);
  const [resolution, setResolution] = useState('release_payment');
  const [adminNote, setAdminNote] = useState('');
  const [noteError, setNoteError] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [confirmResolution, setConfirmResolution] = useState(null);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset page on new search
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchDisputes = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(debouncedSearch ? { q: debouncedSearch } : {}),
        };

        const [disputesRes, statsRes] = await Promise.all([
          getAllDisputes(params),
          getDisputeStats(),
        ]);

        if (disputesRes?.success) {
          setDisputes(disputesRes.disputes || []);
          setTotalPages(disputesRes.totalPages || 1);
          setTotalItems(disputesRes.total ?? disputesRes.disputes?.length ?? 0);
        } else {
          throw new Error(disputesRes?.message || 'Failed to load disputes');
        }

        if (statsRes?.success) {
          setStats(statsRes.stats);
        }

        if (silent) {
          toast.success('Refreshed', 'Dispute queue is up to date.');
        }
      } catch (error) {
        console.error('[ManageDisputes] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          toast.error('Load Failed', 'Could not load disputes.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, statusFilter, debouncedSearch, toast]
  );

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  /* ---------------- Derived ---------------- */
  const activeResolution = useMemo(
    () => RESOLUTION_OPTIONS.find((o) => o.value === resolution),
    [resolution]
  );

  const escrowAmount = useMemo(() => {
    if (!activeDispute) return 0;
    return (
      activeDispute.amount ??
      activeDispute.escrowAmount ??
      activeDispute.contractId?.escrowBalance ??
      0
    );
  }, [activeDispute]);

  const noteLength = adminNote.trim().length;
  const isNoteValid = noteLength >= MIN_NOTE_LENGTH && noteLength <= MAX_NOTE_LENGTH;

  /* ---------------- Reset ---------------- */
  const resetResolutionForm = useCallback(() => {
    setResolution('release_payment');
    setAdminNote('');
    setNoteError(null);
  }, []);

  const closeResolveModal = useCallback(() => {
    if (isResolving) return;
    setActiveDispute(null);
    resetResolutionForm();
  }, [isResolving, resetResolutionForm]);

  /* ---------------- Open modal ---------------- */
  const openResolve = useCallback(
    (dispute) => {
      setActiveDispute(dispute);
      setResolution('release_payment');
      setAdminNote('');
      setNoteError(null);
    },
    []
  );

  /* ---------------- Validate + submit ---------------- */
  const handleResolve = useCallback(async () => {
    if (!activeDispute) return;

    // Validate admin note
    if (!isNoteValid) {
      if (noteLength < MIN_NOTE_LENGTH) {
        setNoteError(`Add at least ${MIN_NOTE_LENGTH} characters explaining your decision.`);
      } else {
        setNoteError(`Note cannot exceed ${MAX_NOTE_LENGTH} characters.`);
      }
      toast.error('Note Required', 'Please explain your decision.');
      return;
    }

    setIsResolving(true);

    try {
      const response = await resolveDispute(activeDispute._id, {
        resolution,
        adminNote: adminNote.trim(),
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Resolution failed');
      }

      // Optimistic removal from list + stats decrement
      setDisputes((prev) => prev.filter((d) => d._id !== activeDispute._id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              open: Math.max(0, (prev.open || 0) - 1),
              resolved: (prev.resolved || 0) + 1,
            }
          : prev
      );

      toast.success('Dispute Resolved', 'Resolution applied successfully.');
      setConfirmResolution(null);
      setActiveDispute(null);
      resetResolutionForm();

      // Reconcile with server (accounts for pagination shifts)
      fetchDisputes({ silent: true });
    } catch (error) {
      console.error('[ManageDisputes] resolve failed:', error);
      toast.error(
        'Resolve Failed',
        error?.response?.data?.message || error?.message || 'Could not resolve dispute.'
      );
    } finally {
      setIsResolving(false);
    }
  }, [
    activeDispute,
    resolution,
    adminNote,
    isNoteValid,
    noteLength,
    toast,
    fetchDisputes,
    resetResolutionForm,
  ]);

  /* ---------------- Confirm gate ---------------- */
  const requestConfirm = useCallback(() => {
    if (!activeDispute) return;

    // Validate first
    if (!isNoteValid) {
      setNoteError(
        noteLength < MIN_NOTE_LENGTH
          ? `Add at least ${MIN_NOTE_LENGTH} characters explaining your decision.`
          : `Note cannot exceed ${MAX_NOTE_LENGTH} characters.`
      );
      toast.error('Note Required', 'Please explain your decision.');
      return;
    }

    setConfirmResolution({
      resolution,
      label: activeResolution?.label || 'Resolve',
      variant: activeResolution?.variant || 'primary',
    });
  }, [activeDispute, isNoteValid, noteLength, resolution, activeResolution, toast]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading && disputes.length === 0) {
    return <DisputesSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && disputes.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load disputes"
          description="We hit a snag reaching the arbitration service. Try again in a moment."
          action={
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => fetchDisputes()}>
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
            Escrow Arbitration
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Disputes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Resolve escrow conflicts between clients and freelancers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => fetchDisputes({ silent: true })}
          disabled={isRefreshing}
          aria-label="Refresh disputes"
          className={isRefreshing ? 'animate-pulse' : ''}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      {/* Stats */}
      {stats && (
        <section
          aria-label="Dispute statistics"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <StatTile label="Total"        value={stats.total}       tint="text-slate-900 dark:text-white" />
          <StatTile label="Open"         value={stats.open}        tint="text-rose-600"                  urgent={stats.open > 0} />
          <StatTile label="Under Review" value={stats.underReview} tint="text-amber-600" />
          <StatTile label="Resolved"     value={stats.resolved}    tint="text-emerald-600" />
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reason, user, or project…"
            aria-label="Search disputes"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                     rounded-xl px-3 py-2 text-xs font-semibold
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {disputes.length > 0 ? (
        <>
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <DisputeCard
                key={dispute._id}
                dispute={toDisputeCardShape(dispute)}
                onResolve={() => openResolve(dispute)}
                isAdminView
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              aria-label="Disputes pagination"
            />
          )}
        </>
      ) : debouncedSearch || statusFilter ? (
        <EmptyState
          icon={Search}
          title="No matching disputes"
          description={`Nothing matched your current filters.`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="All clear — no disputes"
          description="The arbitration queue is empty. Nice work."
        />
      )}

      {/* Resolve modal */}
      {activeDispute && (
        <Modal
          isOpen={!!activeDispute}
          onClose={closeResolveModal}
          title="Resolve Dispute"
          subtitle={activeDispute.reason || 'Escrow conflict'}
          maxWidth="max-w-lg"
          preventClose={isResolving}
        >
          <div className="space-y-5">
            {/* Context panel */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-slate-800">
              <ContextRow label="Project"    value={activeDispute.projectId?.title || 'N/A'} />
              <ContextRow label="Opened By"  value={activeDispute.openedBy?.name || 'N/A'} />
              <ContextRow label="Against"    value={activeDispute.against?.name || 'N/A'} />
              {escrowAmount > 0 && (
                <ContextRow
                  label="Escrow"
                  value={formatCurrency(escrowAmount)}
                  icon={IndianRupee}
                  highlight
                />
              )}
            </div>

            {/* Resolution selection */}
            <fieldset>
              <legend className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-400">
                Resolution
              </legend>
              <div className="space-y-2">
                {RESOLUTION_OPTIONS.map((opt) => {
                  const isSelected = resolution === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value={opt.value}
                        checked={isSelected}
                        onChange={(e) => setResolution(e.target.value)}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 text-pretty">
                          {opt.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Admin note */}
            <Textarea
              label="Admin Note"
              value={adminNote}
              onChange={(e) => {
                setAdminNote(e.target.value);
                if (noteError) setNoteError(null);
              }}
              onBlur={() => {
                if (noteLength > 0 && noteLength < MIN_NOTE_LENGTH) {
                  setNoteError(`Add at least ${MIN_NOTE_LENGTH} characters.`);
                }
              }}
              placeholder="Explain your decision — visible to both parties and stored in the audit log."
              rows={4}
              maxLength={MAX_NOTE_LENGTH}
              error={noteError}
              helperText={`${noteLength}/${MAX_NOTE_LENGTH} characters · required`}
              required
            />

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={closeResolveModal}
                disabled={isResolving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={requestConfirm}
                disabled={isResolving || !isNoteValid}
              >
                Confirm Resolution
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Final confirmation */}
      <ConfirmDialog
        isOpen={!!confirmResolution}
        onClose={() => !isResolving && setConfirmResolution(null)}
        onConfirm={handleResolve}
        title="Confirm Resolution?"
        description={
          confirmResolution && escrowAmount > 0
            ? `${confirmResolution.label}. This will ${resolveImpactText(
                confirmResolution.resolution,
                escrowAmount
              )} This action is final and cannot be undone.`
            : 'This action is final and cannot be undone.'
        }
        confirmLabel={isResolving ? 'Applying…' : 'Apply Resolution'}
        variant={confirmResolution?.variant === 'success' ? 'primary' : 'danger'}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function StatTile({ label, value = 0, tint, urgent = false }) {
  return (
    <div
      className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl text-center transition-colors ${
        urgent
          ? 'border-rose-300 dark:border-rose-800/60'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className={`text-2xl font-extrabold tabular-nums ${tint}`}>
        {Number(value || 0).toLocaleString()}
      </span>
    </div>
  );
}

function ContextRow({ label, value, icon: Icon, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}:</span>
      <span
        className={`font-semibold flex items-center gap-1 truncate ${
          highlight ? 'text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-200'
        }`}
        title={typeof value === 'string' ? value : undefined}
      >
        {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
        {value}
      </span>
    </div>
  );
}

function DisputesSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function toDisputeCardShape(dispute) {
  return {
    id: dispute._id,
    reason: dispute.reason,
    description: dispute.description,
    status: dispute.status,
    projectTitle: dispute.projectId?.title || 'Project',
    openedByName: dispute.openedBy?.name || 'User',
    againstName: dispute.against?.name || 'User',
    createdAt: dispute.createdAt,
    resolution: dispute.resolution,
    adminNote: dispute.adminNote,
  };
}

function resolveImpactText(resolution, amount) {
  const inr = formatCurrency(amount);
  switch (resolution) {
    case 'release_payment':
      return `release ${inr} to the freelancer.`;
    case 'refund_client':
      return `refund ${inr} to the client.`;
    case 'partial_refund':
      return `split ${inr} between both parties.`;
    case 'no_action':
      return 'close the dispute without moving funds.';
    default:
      return 'apply the resolution.';
  }
}

export default ManageDisputesPage;
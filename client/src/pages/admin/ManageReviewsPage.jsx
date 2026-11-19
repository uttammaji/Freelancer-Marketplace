// client/src/pages/admin/ManageReviewsPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useToast } from '../../context/ToastContext';
import {
 getUserReviews ,
  deleteReview,
} from '../../services/review.service';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Star,
  ShieldAlert,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  Flag,
  MessageSquare,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

const RATING_FILTERS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5',   label: '5 stars' },
  { value: '4',   label: '4 stars' },
  { value: '3',   label: '3 stars' },
  { value: '2',   label: '2 stars' },
  { value: '1',   label: '1 star' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ManageReviewsPage() {
  const toast = useToast();

  /* ---------- Data ---------- */
  const [reviews, setReviews] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [endpointMissing, setEndpointMissing] = useState(false);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Moderation ---------- */
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchReviews = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        // Will throw / return undefined if the admin endpoint doesn't exist yet
        const response = await getAllReviewsAdmin?.({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(ratingFilter !== 'all' ? { rating: Number(ratingFilter) } : {}),
        });

        if (!response) {
          // Endpoint not implemented in the service layer
          setEndpointMissing(true);
          setReviews([]);
          setTotalPages(1);
          setTotalCount(0);
          return;
        }

        if (!response.success) {
          throw new Error(response.message || 'Failed to load reviews');
        }

        setEndpointMissing(false);
        setReviews(response.reviews || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || 0);

        if (silent) {
          toast.success('Refreshed', 'Review queue is up to date.');
        }
      } catch (error) {
        console.error('[ManageReviews] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setReviews([]);
          toast.error('Load Failed', 'Could not load reviews.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, debouncedSearch, ratingFilter, toast]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /* ---------------- Derived ---------------- */
  const hasActiveFilters = useMemo(
    () => Boolean(debouncedSearch) || ratingFilter !== 'all',
    [debouncedSearch, ratingFilter]
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setRatingFilter('all');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---------------- Delete ---------------- */
  const requestDelete = useCallback((review) => {
    setReviewToDelete(review);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    const targetId = reviewToDelete._id;
    const snapshot = reviews;

    // Optimistic removal
    setReviews((prev) => prev.filter((r) => r._id !== targetId));
    setTotalCount((prev) => Math.max(0, prev - 1));
    setReviewToDelete(null);

    try {
      const response = await deleteReview(targetId);
      if (!response?.success) throw new Error(response?.message);

      toast.success('Review Deleted', 'Review has been removed from the platform.');
    } catch (error) {
      console.error('[ManageReviews] delete failed:', error);
      // Rollback
      setReviews(snapshot);
      setTotalCount((prev) => prev + 1);
      toast.error(
        'Delete Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Could not delete review.'
      );
    } finally {
      setIsDeleting(false);
    }
  }, [reviewToDelete, reviews, toast]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading && reviews.length === 0 && !endpointMissing) {
    return <ReviewsSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && reviews.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load reviews"
          description="We hit a snag reaching the review service. Try again in a moment."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchReviews()}
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
            Quality & Trust Operations
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Review Moderation & Trust Scores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Audit client ratings, flag spam or inappropriate feedback, and ensure review integrity.
          </p>
        </div>

        {!endpointMissing && (
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchReviews({ silent: true })}
            disabled={isRefreshing}
            aria-label="Refresh reviews"
            className={isRefreshing ? 'animate-pulse' : ''}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        )}
      </header>

      {/* Endpoint-missing banner */}
      {endpointMissing && <EndpointMissingBanner />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, project, or comment…"
            aria-label="Search reviews"
          />
        </div>

        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <label htmlFor="rating-filter" className="sr-only">
            Filter by rating
          </label>
          <select
            id="rating-filter"
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                       cursor-pointer"
          >
            {RATING_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {endpointMissing ? (
        <EmptyState
          icon={ShieldAlert}
          title="Admin reviews endpoint not yet available"
          description="Moderation is ready to go — it just needs getAllReviewsAdmin() in review.service.js. Once added, this page will populate automatically."
          action={
            <a
              href="/docs/admin-reviews-api.md"
              className="btn-ghost text-xs"
            >
              View API spec
            </a>
          }
        />
      ) : reviews.length > 0 ? (
        <>
          {/* Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">
              Showing {reviews.length} of {totalCount.toLocaleString()} review
              {totalCount === 1 ? '' : 's'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewRow
                key={review._id}
                review={review}
                onDelete={() => requestDelete(review)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              aria-label="Reviews pagination"
            />
          )}
        </>
      ) : hasActiveFilters ? (
        <EmptyState
          icon={Search}
          title="No matching reviews"
          description="Nothing matched your current filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No reviews to moderate"
          description="Reviews will appear here as soon as clients start rating freelancers."
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!reviewToDelete}
        onClose={() => !isDeleting && setReviewToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Review?"
        description={
          reviewToDelete
            ? `Are you sure you want to delete this review by ${
                reviewToDelete.reviewerId?.name || 'User'
              }? This will permanently remove the rating from the platform and adjust the recipient's trust score. This action cannot be undone.`
            : ''
        }
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete Review'}
        variant="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

/**
 * A review card with a hover-revealed moderation toolbar.
 * Renders the ReviewCard plus optional admin controls.
 */
const ReviewRow = React.memo(function ReviewRow({ review, onDelete }) {
  return (
    <div className="relative group">
      <ReviewCard
        review={{
          id: review._id,
          clientName: review.reviewerId?.name || 'User',
          clientAvatar: review.reviewerId?.avatar || '',
          projectTitle: review.projectId?.title || 'Project',
          rating: review.rating,
          date: review.createdAt,
          comment: review.comment || '',
        }}
      />

      {/* Moderation toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        {review.flagged && (
          <span
            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
            title="Flagged by users"
          >
            <Flag className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60
                     text-rose-600 dark:text-rose-400
                     hover:bg-rose-100 dark:hover:bg-rose-950
                     transition-colors
                     focus:outline-none focus-visible:ring-2
                     focus-visible:ring-rose-500"
          aria-label={`Delete review by ${review.reviewerId?.name || 'user'}`}
          title="Delete review"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

function EndpointMissingBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-300/60 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30">
      <ShieldAlert
        className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="text-xs text-amber-900 dark:text-amber-200 min-w-0">
        <div className="font-bold mb-0.5">Admin reviews API not connected</div>
        <p className="text-pretty">
          The moderation UI is ready, but <code className="font-mono text-[11px]">getAllReviewsAdmin()</code>{' '}
          isn&apos;t implemented in <code className="font-mono text-[11px]">review.service.js</code> yet.
          Once the endpoint ships, this page will populate automatically — no changes needed here.
        </p>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default ManageReviewsPage;
// client/src/pages/client/ClientReviewsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getUserReviews,
  getReviewSummary,
} from '../../services/review.service';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Star,
  RefreshCw,
  AlertCircle,
  Search,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Award,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const SEARCH_DEBOUNCE_MS = 300;
const RECENT_REVIEWS_LIMIT = 5;

const RATING_FILTERS = [
  { value: 'all', label: 'All' },
  { value: '5',   label: '5 ★' },
  { value: '4',   label: '4 ★' },
  { value: '3',   label: '3 ★' },
  { value: '2',   label: '2 ★' },
  { value: '1',   label: '1 ★' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/**
 * Compute average across a list using a getter.
 * Returns 0 when the list is empty.
 */
function averageOf(list, getter) {
  if (!list.length) return 0;
  const total = list.reduce((sum, item) => sum + safeNumber(getter(item)), 0);
  return total / list.length;
}

/**
 * Compute distribution of ratings 1–5.
 */
function buildDistribution(reviews) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const rating = clamp(Math.round(safeNumber(r.rating)), 1, 5);
    if (rating >= 1) dist[rating] = (dist[rating] || 0) + 1;
  }
  return dist;
}

/**
 * Extract criteria scores from a review, with sensible fallbacks.
 */
function getCriteria(review) {
  const fallback = safeNumber(review.rating);
  return {
    communication: safeNumber(
      review.communicationRating ?? review.communication ?? fallback
    ),
    quality: safeNumber(
      review.qualityRating ?? review.quality ?? fallback
    ),
    professionalism: safeNumber(
      review.professionalismRating ?? review.professionalism ?? fallback
    ),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ClientReviewsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const currentUserId = currentUser?.id || currentUser?._id;

  /* ---------- Data ---------- */
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!currentUserId) return;

      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [reviewsRes, summaryRes] = await Promise.all([
          getUserReviews(currentUserId),
          getReviewSummary(currentUserId),
        ]);

        if (reviewsRes?.success) {
          setReviews(reviewsRes.reviews || []);
        }
        if (summaryRes?.success) {
          setSummary(summaryRes.summary);
        }

        if (silent) {
          toast.success('Refreshed', 'Reviews are up to date.');
        }
      } catch (error) {
        console.error('[ClientReviews] fetch failed:', error);
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
    [currentUserId, toast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------- Derived analytics ---------------- */
  const analytics = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        criteria: { communication: 0, quality: 0, professionalism: 0 },
        recentCount: 0,
      };
    }

    return {
      average:
        safeNumber(summary?.averageRating) ||
        averageOf(reviews, (r) => r.rating),
      total: reviews.length,
      distribution: buildDistribution(reviews),
      criteria: {
        communication: averageOf(reviews, (r) => getCriteria(r).communication),
        quality: averageOf(reviews, (r) => getCriteria(r).quality),
        professionalism: averageOf(reviews, (r) => getCriteria(r).professionalism),
      },
      recentCount: reviews.filter((r) => {
        const d = new Date(r.createdAt || 0);
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return d.getTime() > thirtyDaysAgo;
      }).length,
    };
  }, [reviews, summary]);

  /* ---------------- Filtered list ---------------- */
  const filteredReviews = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return reviews.filter((r) => {
      if (ratingFilter !== 'all') {
        const rating = String(clamp(Math.round(safeNumber(r.rating)), 1, 5));
        if (rating !== ratingFilter) return false;
      }
      if (!q) return true;
      return (
        r.reviewerId?.name?.toLowerCase().includes(q) ||
        r.projectId?.title?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      );
    });
  }, [reviews, debouncedSearch, ratingFilter]);

  const hasActiveFilters = Boolean(debouncedSearch) || ratingFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearch('');
    setRatingFilter('all');
  }, []);

  /* ---------------- Map to card shape ---------------- */
  const mapReviewToCard = useCallback(
    (review) => ({
      id: review._id,
      clientName: review.reviewerId?.name || 'Freelancer',
      clientCompany:
        review.reviewerId?.role === 'freelancer' ? 'Freelancer' : 'Client',
      clientAvatar: review.reviewerId?.avatar || '',
      projectTitle: review.projectId?.title || 'Project',
      rating: safeNumber(review.rating),
      date: review.createdAt,
      comment: review.comment || '',
      criteria: getCriteria(review),
    }),
    []
  );

  /* ---------------- Render: loading ---------------- */
  if (isLoading && reviews.length === 0) {
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
              onClick={() => fetchData()}
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
          <Badge variant="warning" size="sm" className="mb-2">
            Reputation & Feedback
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Feedback received from freelancers you&apos;ve worked with.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchData({ silent: true })}
            disabled={isRefreshing}
            aria-label="Refresh reviews"
            className={isRefreshing ? 'animate-pulse' : ''}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </header>

      {/* ---------- Summary panel ---------- */}
      {reviews.length > 0 && (
        <section
          aria-label="Rating summary"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Big average */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft flex flex-col items-center justify-center text-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Overall Rating
            </span>
            <div className="font-display text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {analytics.average.toFixed(2)}
            </div>
            <Rating
              value={analytics.average}
              size="md"
              showNumber={false}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Based on {analytics.total.toLocaleString()} review
              {analytics.total === 1 ? '' : 's'}
            </span>

            {analytics.recentCount > 0 && (
              <Badge variant="success" size="sm" className="mt-1">
                <TrendingUp className="w-3 h-3" aria-hidden="true" />
                {analytics.recentCount} in the last 30 days
              </Badge>
            )}
          </div>

          {/* Distribution */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">
              Rating Distribution
            </h2>

            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = analytics.distribution[star] || 0;
                const pct =
                  analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 tabular-nums shrink-0">
                      {star} ★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right tabular-nums shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Criteria averages */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">
              Category Breakdown
            </h2>

            <div className="space-y-4">
              <CriteriaRow
                icon={MessageSquare}
                label="Communication"
                value={analytics.criteria.communication}
              />
              <CriteriaRow
                icon={Award}
                label="Quality of Work"
                value={analytics.criteria.quality}
              />
              <CriteriaRow
                icon={ThumbsUp}
                label="Professionalism"
                value={analytics.criteria.professionalism}
              />
            </div>
          </div>
        </section>
      )}

      {/* ---------- Filters ---------- */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 sm:max-w-md">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by freelancer, project, or comment…"
              aria-label="Search reviews"
            />
          </div>

          <div
            className="inline-flex flex-wrap rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950 gap-0.5"
            role="tablist"
            aria-label="Filter by rating"
          >
            {RATING_FILTERS.map((tab) => {
              const isActive = ratingFilter === tab.value;
              const count =
                tab.value === 'all'
                  ? analytics.total
                  : analytics.distribution[Number(tab.value)] || 0;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setRatingFilter(tab.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- Reviews list ---------- */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Once you complete contracts, freelancers will leave reviews here."
        />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching reviews"
          description={
            hasActiveFilters
              ? 'Try a different search or rating filter.'
              : 'No reviews match the current criteria.'
          }
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Count summary */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">
              Showing {filteredReviews.length} of {analytics.total} review
              {analytics.total === 1 ? '' : 's'}
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
            {filteredReviews.map((review) => (
              <ReviewCard key={review._id} review={mapReviewToCard(review)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function CriteriaRow({ icon: Icon, label, value }) {
  const pct = (clamp(value, 0, 5) / 5) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Icon className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          {label}
        </span>
        <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default ClientReviewsPage;
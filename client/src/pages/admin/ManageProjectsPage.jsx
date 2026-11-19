// client/src/pages/admin/ManageProjectsPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getAllProjectsAdmin } from '../../services/project.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Eye,
  Briefcase,
  Filter,
  RefreshCw,
  AlertCircle,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldAlert,
  Users,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Status configuration — single source of truth for badges and row tinting.
 */
const STATUS_CONFIG = {
  open:        { label: 'Open',        variant: 'warning',  icon: Clock,         tint: '' },
  in_progress: { label: 'In Progress', variant: 'primary',  icon: Clock,         tint: '' },
  submitted:   { label: 'Submitted',   variant: 'info',     icon: FileText,      tint: '' },
  completed:   { label: 'Completed',   variant: 'success',  icon: CheckCircle2,  tint: '' },
  cancelled:   { label: 'Cancelled',   variant: 'danger',   icon: XCircle,       tint: 'opacity-60' },
  disputed:    { label: 'Disputed',    variant: 'danger',   icon: ShieldAlert,   tint: 'bg-rose-50/40 dark:bg-rose-950/20' },
};

const DEFAULT_STATUS = {
  label: 'Open',
  variant: 'warning',
  icon: Clock,
  tint: '',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
];

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

const getStatusConfig = (status) => STATUS_CONFIG[status] || DEFAULT_STATUS;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ManageProjectsPage() {
  const toast = useToast();

  /* ---------- Data ---------- */
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchProjects = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        };

        const response = await getAllProjectsAdmin(params);

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to load projects');
        }

        setProjects(response.projects || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || 0);

        if (silent) {
          toast.success('Refreshed', 'Project list is up to date.');
        }
      } catch (error) {
        console.error('[ManageProjects] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setProjects([]);
          toast.error('Load Failed', 'Could not load projects.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, debouncedSearch, statusFilter, toast]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ---------------- Derived ---------------- */
  const hasActiveFilters = useMemo(
    () => Boolean(debouncedSearch) || statusFilter !== 'all',
    [debouncedSearch, statusFilter]
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---------------- Render: loading ---------------- */
  if (isLoading && projects.length === 0) {
    return <ProjectsSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && projects.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load projects"
          description="We hit a snag reaching the project moderation service. Try again in a moment."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchProjects()}
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
            Platform Content Moderation
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Marketplace Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Total{' '}
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {totalCount.toLocaleString()}
            </span>{' '}
            project{totalCount === 1 ? '' : 's'} • Audit and moderate across all statuses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => fetchProjects({ silent: true })}
          disabled={isRefreshing}
          aria-label="Refresh projects"
          className={isRefreshing ? 'animate-pulse' : ''}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, client, or category…"
            aria-label="Search projects"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter
            className="w-4 h-4 text-slate-400 shrink-0"
            aria-hidden="true"
          />
          <label htmlFor="project-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="project-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
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

      {/* Content */}
      {projects.length > 0 ? (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <caption className="sr-only">
                  Marketplace projects with client, budget, and status
                </caption>
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">Project Title</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Client</th>
                    <th scope="col" className="px-6 py-4 text-right">Budget</th>
                    <th scope="col" className="px-6 py-4 text-center">Proposals</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">
                      <span className="sr-only">Actions</span>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projects.map((project) => {
                    const config = getStatusConfig(project.status);
                    const StatusIcon = config.icon;
                    const budgetMin = Number(project.budget?.min) || 0;
                    const budgetMax = Number(project.budget?.max) || 0;
                    const hasRange = budgetMax > budgetMin && budgetMax > 0;

                    return (
                      <tr
                        key={project._id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${config.tint}`}
                      >
                        {/* Title + posted date */}
                        <td className="px-6 py-4 max-w-xs">
                          <div
                            className="font-bold text-slate-900 dark:text-white truncate"
                            title={project.title}
                          >
                            {project.title || 'Untitled Project'}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Posted {safeFormatDate(project.createdAt)}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <Badge variant="primary" size="sm">
                            {project.categoryId?.name || 'General'}
                          </Badge>
                        </td>

                        {/* Client */}
                        <td className="px-6 py-4 max-w-[200px]">
                          <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {project.clientId?.name || 'Client'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate" title={project.clientId?.email}>
                            {project.clientId?.email || ''}
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-6 py-4 text-right tabular-nums whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {safeFormatCurrency(budgetMin)}
                          </div>
                          {hasRange && (
                            <div className="text-[11px] text-slate-400">
                              up to {safeFormatCurrency(budgetMax)}
                            </div>
                          )}
                        </td>

                        {/* Proposals */}
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-slate-900 dark:text-white tabular-nums inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            {Number(project.proposalCount || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <Badge variant={config.variant} size="sm" dot>
                            <StatusIcon className="w-3 h-3" aria-hidden="true" />
                            {config.label}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/projects/${project._id}`}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800
                                         hover:bg-slate-200 dark:hover:bg-slate-700
                                         text-slate-700 dark:text-slate-300 transition-colors
                                         focus:outline-none focus-visible:ring-2
                                         focus-visible:ring-purple-500"
                              aria-label={`View ${project.title || 'project'} details`}
                              title="View project details"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            </Link>
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
              onPageChange={handlePageChange}
              aria-label="Projects pagination"
            />
          )}
        </>
      ) : hasActiveFilters ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description="Nothing matched your current filters. Try a different search or clear the status filter."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Projects will appear here as soon as clients start posting."
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function ProjectsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default ManageProjectsPage;
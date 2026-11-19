// client/src/pages/client/MyProjectsPage.jsx
import React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  getMyProjects,
  updateProjectStatus,
} from '../../services/project.service';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FolderPlus,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  Search,
  XCircle,
  Clock,
  FileText,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const SEARCH_DEBOUNCE_MS = 300;
const CANCELLABLE_STATUSES = ['open'];

/**
 * Status → { label, variant, icon } — single source of truth.
 */
const STATUS_CONFIG = {
  open:        { label: 'Open for Bids',   variant: 'warning', icon: Clock         },
  in_progress: { label: 'In Progress',     variant: 'primary', icon: Clock         },
  submitted:   { label: 'Work Submitted',  variant: 'info',    icon: FileText      },
  completed:   { label: 'Completed',       variant: 'success', icon: CheckCircle2  },
  cancelled:   { label: 'Cancelled',       variant: 'danger',  icon: XCircle       },
  disputed:    { label: 'Disputed',        variant: 'danger',  icon: ShieldAlert   },
  draft:       { label: 'Draft',           variant: 'default', icon: FileText      },
};

const DEFAULT_STATUS = {
  label: 'Open',
  variant: 'warning',
  icon: Clock,
};

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

const getStatusConfig = (status) => STATUS_CONFIG[status] || DEFAULT_STATUS;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function MyProjectsPage() {
  const toast = useToast();
  const navigate = useNavigate();

  /* ---------- Data ---------- */
  const [projects, setProjects] = useState([]);

  /* ---------- Filters ---------- */
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [projectToCancel, setProjectToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchProjects = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const response = await getMyProjects();
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to load projects');
        }

        setProjects(response.projects || []);

        if (silent) {
          toast.success('Refreshed', 'Your projects are up to date.');
        }
      } catch (error) {
        console.error('[MyProjects] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setProjects([]);
          toast.error('Load Failed', 'Could not load your projects.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ---------------- Derived: counts ---------------- */
  const counts = useMemo(
    () => ({
      all: projects.length,
      open: projects.filter((p) => p.status === 'open').length,
      in_progress: projects.filter(
        (p) =>
          p.status === 'in_progress' ||
          p.status === 'submitted'
      ).length,
      completed: projects.filter((p) => p.status === 'completed').length,
    }),
    [projects]
  );

  /* ---------------- Filtered list ---------------- */
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return projects.filter((p) => {
      if (activeTab === 'open' && p.status !== 'open') return false;
      if (
        activeTab === 'in_progress' &&
        p.status !== 'in_progress' &&
        p.status !== 'submitted'
      ) {
        return false;
      }
      if (activeTab === 'completed' && p.status !== 'completed') return false;
      if (!q) return true;

      return (
        p.title?.toLowerCase().includes(q) ||
        p.categoryId?.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
  }, [projects, activeTab, debouncedSearch]);

  const hasActiveFilters = Boolean(debouncedSearch);
  const clearFilters = useCallback(() => setSearch(''), []);

  /* ---------------- Tabs ---------------- */
  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All', badge: counts.all },
      { id: 'open', label: 'Open', badge: counts.open },
      { id: 'in_progress', label: 'In Progress', badge: counts.in_progress },
      { id: 'completed', label: 'Completed', badge: counts.completed },
    ],
    [counts]
  );

  /* ---------------- Cancel flow ---------------- */
  const requestCancel = useCallback((project) => {
    setProjectToCancel(project);
  }, []);

  const confirmCancel = useCallback(async () => {
    if (!projectToCancel) return;

    const projectId = projectToCancel._id;
    const snapshot = projects;

    setIsCancelling(true);

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId ? { ...p, status: 'cancelled' } : p
      )
    );
    setProjectToCancel(null);

    try {
      const response = await updateProjectStatus(projectId, 'cancelled');
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to cancel project');
      }

      toast.success(
        'Project Cancelled',
        'Freelancers will no longer be able to submit new proposals.'
      );
    } catch (error) {
      console.error('[MyProjects] cancel failed:', error);
      // Rollback
      setProjects(snapshot);
      toast.error(
        'Action Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Could not cancel project.'
      );
    } finally {
      setIsCancelling(false);
    }
  }, [projectToCancel, projects, toast]);

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
          title="Couldn't load your projects"
          description="We hit a snag fetching your project listings. Try again in a moment."
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
          <Badge variant="primary" size="sm" className="mb-2">
            Project Management
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Posted Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Track incoming bids, contract progress, and deliverables across all your listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
          <Link to="/dashboard/client/projects/new">
            <Button variant="primary" size="md" icon={FolderPlus}>
              Post a Project
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs + search */}
      {projects.length > 0 && (
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
              placeholder="Search projects…"
              aria-label="Search projects"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create your first job posting to start receiving proposals from top freelancers."
          action={
            <Link to="/dashboard/client/projects/new">
              <Button variant="primary" size="md" icon={FolderPlus}>
                Post a Project
              </Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description={
            hasActiveFilters
              ? `No projects match "${debouncedSearch}".`
              : 'No projects in this tab.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear search
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                View all projects
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((project) => (
            <ProjectRow
              key={project._id}
              project={project}
              onCancel={() => requestCancel(project)}
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation */}
      <ConfirmDialog
        isOpen={!!projectToCancel}
        onClose={() => !isCancelling && setProjectToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel this project?"
        description={
          projectToCancel
            ? `"${projectToCancel.title}" will be closed to new proposals. Existing bidders will be notified. This action cannot be undone.`
            : ''
        }
        confirmLabel={isCancelling ? 'Cancelling…' : 'Cancel Project'}
        cancelLabel="Keep Project"
        variant="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
const ProjectRow = React.memo(function ProjectRow({ project, onCancel }) {
  const config = getStatusConfig(project.status);
  const StatusIcon = config.icon;
  const budgetMin = safeNumber(project.budget?.min);
  const budgetMax = safeNumber(project.budget?.max);
  const hasRange = budgetMax > budgetMin && budgetMax > 0;
  const proposalCount = Number(project.proposalCount || 0);
  const isOpen = project.status === 'open';
  const canCancel = CANCELLABLE_STATUSES.includes(project.status);

  return (
    <article className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2 flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={config.variant} size="sm" dot>
            <StatusIcon className="w-3 h-3" aria-hidden="true" />
            {config.label}
          </Badge>
          <span className="text-xs text-slate-400">
            Created {safeFormatDate(project.createdAt)}
          </span>
          {project.categoryId?.name && (
            <>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                •
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {project.categoryId.name}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/projects/${project._id}`}
          className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          <h3
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white
                       group-hover:text-primary-600 dark:group-hover:text-primary-400
                       transition-colors truncate"
            title={project.title}
          >
            {project.title || 'Untitled Project'}
          </h3>
        </Link>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
            {safeFormatCurrency(budgetMin)}
            {hasRange && (
              <span className="text-slate-400 font-normal">
                {' '}– {safeFormatCurrency(budgetMax)}
              </span>
            )}
          </span>
          <span aria-hidden="true">•</span>
          <span className="capitalize">
            {project.experienceLevel || 'intermediate'} level
          </span>
          <span aria-hidden="true">•</span>
          <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold tabular-nums">
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            {proposalCount} proposal{proposalCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        {isOpen && proposalCount > 0 && (
          <Link to={`/dashboard/client/projects/${project._id}/proposals`}>
            <Button variant="primary" size="sm" icon={Users}>
              View {proposalCount} Proposal{proposalCount === 1 ? '' : 's'}
            </Button>
          </Link>
        )}

        {isOpen && proposalCount === 0 && (
          <Link to={`/dashboard/client/projects/${project._id}/proposals`}>
            <Button variant="outline" size="sm" icon={Users}>
              Manage Proposals
            </Button>
          </Link>
        )}

        <Link to={`/projects/${project._id}`}>
          <Button variant="outline" size="sm" icon={ArrowUpRight}>
            Public View
          </Button>
        </Link>

        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400
                       hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40
                       transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label={`Cancel ${project.title || 'project'}`}
            title="Cancel project"
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
});

function ProjectsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

export default MyProjectsPage;
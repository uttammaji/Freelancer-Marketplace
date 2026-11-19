// client/src/pages/client/ClientDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyProfile } from '../../services/profile.service';
import { getMyProjects } from '../../services/project.service';
import { getClientContracts } from '../../services/contract.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Briefcase,
  CreditCard,
  CheckCircle2,
  FolderPlus,
  Users,
  Building,
  Clock,
  FileText,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const RECENT_PROJECTS_LIMIT = 3;
const CHART_MONTHS = 6;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PROJECT_STATUSES = {
  open:        { label: 'Open',        variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'primary' },
  completed:   { label: 'Completed',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'danger'  },
  disputed:    { label: 'Disputed',    variant: 'danger'  },
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

/**
 * Build last-6-months spend series from real contracts.
 * O(n) via a Map, not O(n × 6).
 */
function buildSpendSeries(contracts, monthsBack = CHART_MONTHS) {
  const now = new Date();
  const buckets = new Map();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, { month: MONTH_LABELS[d.getMonth()], spend: 0 });
  }

  for (const c of contracts) {
    const dateStr = c.createdAt || c.startDate;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.spend += safeNumber(c.amount);
    }
  }

  return Array.from(buckets.values());
}

/**
 * Project status → badge config (single source of truth).
 */
function getProjectStatusConfig(status) {
  return PROJECT_STATUSES[status] || { label: status || 'Unknown', variant: 'default' };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ClientDashboard() {
  const { currentUser } = useAuth();
  const toast = useToast();

  /* ---------- Data ---------- */
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------------- Fetch ---------------- */
  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [profileRes, projectsRes, contractsRes] = await Promise.all([
          getMyProfile(),
          getMyProjects(),
          getClientContracts(),
        ]);

        if (profileRes?.success) setProfile(profileRes.profile);
        if (projectsRes?.success) setProjects(projectsRes.projects || []);
        if (contractsRes?.success) setContracts(contractsRes.contracts || []);

        if (silent) {
          toast.success('Refreshed', 'Dashboard is up to date.');
        }
      } catch (error) {
        console.error('[ClientDashboard] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          toast.error('Load Failed', 'Could not load dashboard data.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* ---------------- Derived metrics ---------------- */
  const metrics = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'open').length;
    const inProgressProjects = projects.filter((p) => p.status === 'in_progress').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    const activeContracts = contracts.filter((c) =>
      ['pending_payment', 'active', 'submitted', 'revision_requested'].includes(c.status)
    ).length;
    const completedContracts = contracts.filter((c) => c.status === 'completed').length;

    // Total spent = only completed contracts (accurate financials)
    const totalSpentCompleted = contracts
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + safeNumber(c.freelancerAmount ?? c.amount), 0);

    // Total committed = all contracts (completed + active escrow)
    const totalCommitted = contracts.reduce(
      (sum, c) => sum + safeNumber(c.amount),
      0
    );

    // In-escrow = active contracts only
    const inEscrow = contracts
      .filter((c) =>
        ['pending_payment', 'active', 'submitted', 'revision_requested'].includes(c.status)
      )
      .reduce(
        (sum, c) => sum + safeNumber(c.escrowBalance ?? c.amount),
        0
      );

    const uniqueFreelancers = new Set(
      contracts
        .map((c) => c.freelancerId?._id || c.freelancerId)
        .filter(Boolean)
    ).size;

    return {
      totalProjects: projects.length,
      activeProjects,
      inProgressProjects,
      completedProjects,
      activeContracts,
      completedContracts,
      totalSpent: totalSpentCompleted,
      totalCommitted,
      inEscrow,
      freelancersHired: uniqueFreelancers,
    };
  }, [projects, contracts]);

  /* ---------------- Chart series ---------------- */
  const spendSeries = useMemo(
    () => buildSpendSeries(contracts),
    [contracts]
  );

  /* ---------------- Recent projects ---------------- */
  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, RECENT_PROJECTS_LIMIT),
    [projects]
  );

  /* ---------------- Empty-state detection ---------------- */
  const isFreshAccount =
    projects.length === 0 && contracts.length === 0 && !profile?.companyName;

  /* ---------------- Greeting ---------------- */
  const greetingName = useMemo(() => {
    const name = currentUser?.name || currentUser?.fullName;
    return name ? name.split(' ')[0] : 'Client';
  }, [currentUser]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && projects.length === 0 && contracts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load your dashboard"
          description="We hit a snag fetching your data. Try again in a moment."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchDashboardData()}
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
      {/* ============ Welcome banner ============ */}
      <header className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl text-white shadow-soft bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900">
        {/* Subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(79,70,229,0.35), transparent 70%)',
          }}
        />

        <div className="relative space-y-1.5 min-w-0">
          <Badge variant="primary" size="sm">
            Client Operations Hub
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {greetingName}
          </h1>
          <p className="text-xs sm:text-sm text-primary-200 flex items-center gap-2 flex-wrap">
            <Building className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{profile?.companyName || 'Set up your company profile'}</span>
            {profile?.industry && (
              <>
                <span aria-hidden="true">•</span>
                <span>{profile.industry}</span>
              </>
            )}
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          <Link to="/dashboard/client/settings">
            <Button variant="secondary" size="md" className="font-bold shadow-md">
              {profile?.companyName ? 'Edit Profile' : 'Create Profile'}
            </Button>
          </Link>
          <Link to="/dashboard/client/projects/new">
            <Button
              variant="primary"
              size="md"
              icon={FolderPlus}
              className="font-bold shadow-md"
            >
              Post Project
            </Button>
          </Link>
        </div>
      </header>

      {/* ============ Fresh-account onboarding ============ */}
      {isFreshAccount && (
        <section
          aria-label="Getting started"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
              <TrendingUp
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Get started with SkillHire
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-pretty">
                Post your first project to receive proposals from vetted freelancers.
                Most clients get their first bid within 24 hours.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/dashboard/client/projects/new">
                  <Button variant="primary" size="sm" icon={FolderPlus}>
                    Post Your First Project
                  </Button>
                </Link>
                <Link to="/freelancers">
                  <Button variant="outline" size="sm">
                    Browse Freelancers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ Metric cards ============ */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard
          title="Total Projects"
          value={metrics.totalProjects}
          change={`${metrics.activeProjects} open`}
          isPositive={metrics.activeProjects > 0}
          icon={Briefcase}
          color="primary"
          subtitle="All-time projects"
        />
        <StatCard
          title="Active Contracts"
          value={metrics.activeContracts}
          change={`${metrics.completedContracts} completed`}
          isPositive={metrics.activeContracts > 0}
          icon={Clock}
          color="amber"
          subtitle="Currently in progress"
        />
        <StatCard
          title="Total Spent"
          value={safeFormatCurrency(metrics.totalSpent)}
          change={`${safeFormatCurrency(metrics.inEscrow)} in escrow`}
          isPositive
          icon={CreditCard}
          color="emerald"
          subtitle="Across completed contracts"
        />
        <StatCard
          title="Freelancers Hired"
          value={metrics.freelancersHired}
          change={`${metrics.completedProjects} projects delivered`}
          isPositive={metrics.completedProjects > 0}
          icon={Users}
          color="purple"
          subtitle="Unique talent partners"
        />
      </section>

      {/* ============ Chart + Company summary ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Project Spend"
            subtitle="Your actual contract spend, last 6 months"
            action={
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg tabular-nums">
                {safeFormatCurrency(metrics.totalSpent)} Total
              </span>
            }
          >
            {contracts.length === 0 ? (
              <div className="h-64 sm:h-72 flex items-center justify-center text-xs text-slate-400">
                No spending data yet — post a project to get started.
              </div>
            ) : (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={spendSeries}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [safeFormatCurrency(value), 'Spend']}
                    />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#spendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Company Summary */}
        <aside className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Company Summary
            </h2>
            <Building className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>

          {profile ? (
            <dl className="space-y-3 text-xs">
              <SummaryRow label="Company" value={profile.companyName || 'Not set'} />
              <SummaryRow label="Industry" value={profile.industry || 'Not set'} />
              <SummaryRow
                label="Website"
                value={profile.website || 'Not set'}
                valueClass="text-primary-600 dark:text-primary-400 truncate max-w-[150px]"
                isLink={Boolean(profile.website)}
              />
              <SummaryRow
                label="Location"
                value={
                  [profile.location?.city, profile.location?.country]
                    .filter(Boolean)
                    .join(', ') || 'Not set'
                }
              />
              <SummaryRow
                label="Projects Posted"
                value={String(profile.projectsPosted || projects.length)}
                valueClass="tabular-nums"
              />

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link to="/dashboard/client/settings" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    {profile.companyName ? 'Edit Profile' : 'Complete Profile'}
                  </Button>
                </Link>
              </div>
            </dl>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Building className="w-6 h-6 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-xs text-slate-400 text-pretty">
                You haven&apos;t set up your company profile yet. Add details so freelancers know who they&apos;re working with.
              </p>
              <Link to="/dashboard/client/settings" className="block">
                <Button variant="primary" size="sm" className="w-full">
                  Create Profile
                </Button>
              </Link>
            </div>
          )}
        </aside>
      </section>

      {/* ============ Recent Projects ============ */}
      {recentProjects.length > 0 && (
        <section
          aria-label="Recent projects"
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Projects
            </h2>
            <Link
              to="/dashboard/client/projects"
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <ul className="space-y-3">
            {recentProjects.map((project) => (
              <li key={project._id}>
                <Link
                  to={`/projects/${project._id}`}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl
                             bg-slate-50 dark:bg-slate-850/50
                             hover:bg-slate-100 dark:hover:bg-slate-800
                             transition-colors group
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText
                      className="w-4 h-4 text-primary-600 shrink-0"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h3
                        className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                        title={project.title}
                      >
                        {project.title || 'Untitled Project'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge
                          variant={getProjectStatusConfig(project.status).variant}
                          size="sm"
                        >
                          {getProjectStatusConfig(project.status).label}
                        </Badge>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {Number(project.proposalCount || 0)} proposal
                          {project.proposalCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 tabular-nums">
                    {safeFormatCurrency(project.budget?.min)}
                    {project.budget?.max > project.budget?.min && (
                      <span className="text-slate-400 font-normal">
                        {' '}– {safeFormatCurrency(project.budget.max)}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ============ Quick actions ============ */}
      <section aria-label="Quick actions" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          to="/dashboard/client/projects/new"
          icon={FolderPlus}
          title="Post Project"
          description="Create a new project listing"
          tint="text-primary-600 dark:text-primary-400"
          bg="bg-primary-50 dark:bg-primary-950/40"
        />
        <QuickAction
          to="/dashboard/client/projects"
          icon={Briefcase}
          title="My Projects"
          description="Manage your project listings"
          tint="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <QuickAction
          to="/freelancers"
          icon={Users}
          title="Find Freelancers"
          description="Browse talent directory"
          tint="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-950/40"
        />
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
const TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  borderColor: '#334155',
  borderRadius: '12px',
  color: '#FFF',
  fontSize: '12px',
};

function SummaryRow({ label, value, valueClass = '', isLink = false }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500 dark:text-slate-400 shrink-0">{label}</dt>
      <dd
        className={`font-semibold text-slate-900 dark:text-white text-right truncate max-w-[60%] ${valueClass}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, description, tint, bg }) {
  return (
    <Link
      to={to}
      className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                 rounded-3xl shadow-soft hover:border-primary-400 dark:hover:border-primary-600
                 transition-all hover:-translate-y-0.5
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
        <Icon className={`w-5 h-5 ${tint}`} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
        {description}
      </p>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default ClientDashboard;
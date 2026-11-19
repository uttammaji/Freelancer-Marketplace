// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllProjectsAdmin } from '../../services/project.service';
import { getAllDisputes, getDisputeStats } from '../../services/dispute.service';
import { getAllFreelancers, getAllClients } from '../../services/profile.service';
import { getContractStats } from '../../services/contract.service';
import { getPlatformStats } from '../../services/transaction.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DisputeCard } from '../../components/cards/DisputeCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton, ProjectCardSkeleton } from '../../components/common/SkeletonLoader.jsx';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  IndianRupee,
  Scale,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLATFORM_FEE_RATE = 0.05; // 5%
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_MONTHS = 6;

const INITIAL_STATS = {
  totalUsers: 0,
  totalFreelancers: 0,
  totalClients: 0,
  totalProjects: 0,
  openDisputes: 0,
  totalDisputes: 0,
  activeContracts: 0,
  completedContracts: 0,
  totalVolume: 0,
  totalTransactions: 0,
};

/* ------------------------------------------------------------------ */
/*  Helpers (outside component — stable references)                    */
/* ------------------------------------------------------------------ */
const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

/**
 * Build last-6-months GMV + revenue series from real project data.
 * Uses a Map for O(n) bucketing instead of O(n × 6) filter.
 */
function buildChartData(projects, monthsBack = CHART_MONTHS) {
  const now = new Date();
  const buckets = new Map();

  // Pre-seed 6 buckets (oldest → newest)
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, {
      month: MONTH_LABELS[d.getMonth()],
      gmv: 0,
      revenue: 0,
    });
  }

  // Single pass over projects
  for (const p of projects) {
    if (!p?.createdAt) continue;
    const d = new Date(p.createdAt);
    if (Number.isNaN(d.getTime())) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    const amount = Number(p.budget?.max ?? p.budget?.min ?? p.amount ?? 0) || 0;
    bucket.gmv += amount;
    bucket.revenue = Math.round(bucket.gmv * PLATFORM_FEE_RATE);
  }

  return Array.from(buckets.values());
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function AdminDashboard() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(INITIAL_STATS);
  const [recentDisputes, setRecentDisputes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- Data fetch ---------------- */
  const fetchStats = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const [
          freelancersRes,
          clientsRes,
          projectsRes,
          disputeStatsRes,
          disputesRes,
          contractStatsRes,
          platformStatsRes,
        ] = await Promise.all([
          getAllFreelancers({ limit: 1 }),
          getAllClients({ limit: 1 }),
          getAllProjectsAdmin({ limit: 100 }),
          getDisputeStats(),
          getAllDisputes({ limit: 5 }),
          getContractStats(),
          getPlatformStats(),
        ]);

        const totalFreelancers = freelancersRes?.total || 0;
        const totalClients = clientsRes?.total || 0;
        const totalProjects = projectsRes?.total || 0;

        const totalVolume =
          platformStatsRes?.stats?.totalVolume ??
          contractStatsRes?.stats?.totalEarnings ??
          0;
        const totalTransactions = platformStatsRes?.stats?.totalTransactions || 0;

        setStats({
          totalUsers: totalFreelancers + totalClients,
          totalFreelancers,
          totalClients,
          totalProjects,
          openDisputes: disputeStatsRes?.stats?.open || 0,
          totalDisputes: disputeStatsRes?.stats?.total || 0,
          activeContracts: contractStatsRes?.stats?.active || 0,
          completedContracts: contractStatsRes?.stats?.completed || 0,
          totalVolume,
          totalTransactions,
        });

        setRecentDisputes(
          disputesRes?.success ? disputesRes.disputes || [] : []
        );

        setChartData(buildChartData(projectsRes?.projects || []));

        if (silent) {
          toast.success('Refreshed', 'Dashboard data is up to date.');
        }
      } catch (err) {
        console.error('[AdminDashboard] fetch failed:', err);
        setError(err);
        toast.error('Load Failed', 'Could not load dashboard stats.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ---------------- Derived ---------------- */
  const platformRevenue = useMemo(
    () => Math.round(stats.totalVolume * PLATFORM_FEE_RATE),
    [stats.totalVolume]
  );

  const greetingName = useMemo(() => {
    const name = currentUser?.name || currentUser?.fullName;
    return name ? name.split(' ')[0] : 'Admin';
  }, [currentUser]);

  /* ---------------- Loading state ---------------- */
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  /* ---------------- Error state (full) ---------------- */
  if (error && !stats.totalUsers && !stats.totalProjects) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load platform operations"
          description="We hit a snag reaching the admin services. Try again in a moment."
          action={
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => fetchStats()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-white shadow-soft">
        {/* Subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 70%)' }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="purple" size="sm">Executive Control Plane</Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {greetingName}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200">
              Real-time platform stats, dispute arbitrations & escrow security.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchStats({ silent: true })}
              disabled={isRefreshing}
              aria-label="Refresh dashboard data"
              className={isRefreshing ? 'animate-pulse' : ''}
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </Button>

            <Link to="/admin/disputes">
              <Button
                variant={stats.openDisputes > 0 ? 'danger' : 'outline'}
                size="sm"
                icon={Scale}
              >
                {stats.openDisputes > 0
                  ? `${stats.openDisputes} Active Dispute${stats.openDisputes > 1 ? 's' : ''}`
                  : 'No Open Disputes'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Primary stats */}
      <section
        aria-label="Primary platform metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard
          title="Platform GMV"
          value={formatCurrency(stats.totalVolume)}
          change={`${stats.totalTransactions.toLocaleString()} transactions`}
          isPositive
          icon={IndianRupee}
          color="emerald"
          subtitle="Real transaction volume"
        />
        <StatCard
          title={`Platform Revenue (${PLATFORM_FEE_RATE * 100}%)`}
          value={formatCurrency(platformRevenue)}
          change="Net platform fees"
          isPositive
          icon={TrendingUp}
          color="purple"
          subtitle="Automated take rate"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={`${stats.totalFreelancers} freelancers • ${stats.totalClients} clients`}
          isPositive
          icon={Users}
          color="primary"
          subtitle="All platform accounts"
        />
        <StatCard
          title="Open Disputes"
          value={stats.openDisputes}
          change={stats.openDisputes > 0 ? 'Requires arbitration' : 'Zero disputes'}
          isPositive={stats.openDisputes === 0}
          icon={Scale}
          color="rose"
          subtitle="Escrow mediation queue"
        />
      </section>

      {/* Secondary stats */}
      <section
        aria-label="Secondary platform metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MiniStat icon={Briefcase}     label="Total Projects"    value={stats.totalProjects}       tint="text-primary-600" />
        <MiniStat icon={Clock}         label="Active Contracts"  value={stats.activeContracts}     tint="text-amber-600" />
        <MiniStat icon={CheckCircle2}  label="Completed"         value={stats.completedContracts}  tint="text-emerald-600" />
        <MiniStat icon={Scale}         label="Total Disputes"    value={stats.totalDisputes}       tint="text-rose-600" />
      </section>

      {/* Charts */}
      <section
        aria-label="Platform growth charts"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ChartCard title="Monthly Platform GMV" subtitle="Real project volume by month">
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#9333EA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
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
                  formatter={(value) => [inr(value), 'GMV']}
                />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  stroke="#9333EA"
                  strokeWidth={3}
                  fill="url(#gmvGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title={`Platform Commission (${PLATFORM_FEE_RATE * 100}%)`}
          subtitle="Real revenue from platform fees"
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
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
                  formatter={(value) => [inr(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* Recent Disputes */}
      <section aria-label="Recent disputes" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            Recent Disputes
          </h2>
          <Link
            to="/admin/disputes"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            View All →
          </Link>
        </div>

        {recentDisputes.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All clear — no disputes"
            description="The escrow mediation queue is empty. Nice work."
          />
        ) : (
          <div className="space-y-4">
            {recentDisputes.slice(0, 2).map((dispute) => (
              <DisputeCard
                key={dispute._id || dispute.id}
                dispute={{
                  id: dispute._id || dispute.id,
                  reason: dispute.reason,
                  description: dispute.description,
                  status: dispute.status,
                  projectTitle: dispute.projectId?.title || 'Project',
                  openedByName: dispute.openedBy?.name || 'User',
                  againstName: dispute.against?.name || 'User',
                  createdAt: dispute.createdAt,
                }}
                isAdminView
              />
            ))}
          </div>
        )}
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

function MiniStat({ icon: Icon, label, value, tint }) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${tint}`} aria-hidden="true" />
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
        {Number(value || 0).toLocaleString()}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default AdminDashboard;
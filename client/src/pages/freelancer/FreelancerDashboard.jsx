// client/src/pages/freelancer/FreelancerDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyProfile } from '../../services/profile.service';
import { getMyProposals } from '../../services/proposal.service';
import { getFreelancerContracts } from '../../services/contract.service';
import { getReviewSummary } from '../../services/review.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import {
  Briefcase,
  Search,
  Star,
  Clock,
  FileText,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  IndianRupee,
  Shield,
  CheckCircle2,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
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
const RECENT_PROPOSALS_LIMIT = 3;
const CHART_MONTHS = 6;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PLATFORM_FEE_RATE = 0.05;

const PROPOSAL_STATUS = {
  pending:     { label: 'Pending',     variant: 'warning' },
  shortlisted: { label: 'Shortlisted', variant: 'primary' },
  accepted:    { label: 'Accepted',    variant: 'success' },
  rejected:    { label: 'Rejected',    variant: 'danger'  },
  withdrawn:   { label: 'Withdrawn',   variant: 'default' },
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

/**
 * Compute last-6-months earnings from freelancer contracts.
 * Uses a Map for O(n) bucketing. Includes both completed & in-progress
 * contracts so the chart shows projected earnings too.
 */
function buildEarningsSeries(contracts, monthsBack = CHART_MONTHS) {
  const now = new Date();
  const buckets = new Map();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, {
      month: MONTH_LABELS[d.getMonth()],
      earnings: 0,
      earned: 0,
    });
  }

  for (const c of contracts) {
    // Only completed contracts count toward "earned"
    if (c.status !== 'completed') continue;

    const dateStr = c.completedAt || c.createdAt;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    const amount = safeNumber(c.freelancerAmount ?? c.amount);
    bucket.earnings += amount;
    bucket.earned = bucket.earnings;
  }

  return Array.from(buckets.values());
}

const getProposalStatusConfig = (status) =>
  PROPOSAL_STATUS[status] || {
    label: status || 'Unknown',
    variant: 'default',
  };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function FreelancerDashboard() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const currentUserId = currentUser?.id || currentUser?._id;

  /* ---------- Data ---------- */
  const [profile, setProfile] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);

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
        const requests = [
          getMyProfile(),
          getMyProposals(),
          getFreelancerContracts(),
        ];
        if (currentUserId) {
          requests.push(getReviewSummary(currentUserId));
        }

        const [profileRes, proposalsRes, contractsRes, reviewSummaryRes] =
          await Promise.all(requests);

        if (profileRes?.success) setProfile(profileRes.profile);
        if (proposalsRes?.success) setProposals(proposalsRes.proposals || []);
        if (contractsRes?.success) setContracts(contractsRes.contracts || []);
        if (reviewSummaryRes?.success) setRatingSummary(reviewSummaryRes.summary);

        if (silent) {
          toast.success('Refreshed', 'Dashboard is up to date.');
        }
      } catch (error) {
        console.error('[FreelancerDashboard] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          toast.error('Load Failed', 'Could not load dashboard data.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUserId, toast]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* ---------------- Derived: rating ---------------- */
  const rating = useMemo(() => {
    const avg =
      safeNumber(ratingSummary?.averageRating) ||
      safeNumber(profile?.rating?.average);
    const total =
      safeNumber(ratingSummary?.totalReviews) ||
      safeNumber(profile?.rating?.count);
    return { average: avg, total };
  }, [ratingSummary, profile]);

  /* ---------------- Derived: metrics ---------------- */
  const metrics = useMemo(() => {
    // Contracts
    const activeContracts = contracts.filter((c) =>
      ['pending_payment', 'active', 'submitted', 'revision_requested'].includes(c.status)
    ).length;

    const completedContracts = contracts.filter(
      (c) => c.status === 'completed'
    ).length;

    // Real earned (only completed contracts count)
    const totalEarned = contracts
      .filter((c) => c.status === 'completed')
      .reduce(
        (sum, c) => sum + safeNumber(c.freelancerAmount ?? c.amount),
        0
      );

    // In escrow (active contracts)
    const inEscrow = contracts
      .filter((c) =>
        ['active', 'submitted', 'revision_requested'].includes(c.status)
      )
      .reduce(
        (sum, c) => sum + safeNumber(c.escrowBalance ?? c.freelancerAmount ?? c.amount),
        0
      );

    // Pending payout (submitted, awaiting client approval)
    const pendingPayout = contracts
      .filter((c) => c.status === 'submitted')
      .reduce(
        (sum, c) => sum + safeNumber(c.freelancerAmount ?? c.amount),
        0
      );

    // Proposals
    const pendingProposals = proposals.filter(
      (p) => p.status === 'pending'
    ).length;
    const shortlistedProposals = proposals.filter(
      (p) => p.status === 'shortlisted'
    ).length;
    const acceptedProposals = proposals.filter(
      (p) => p.status === 'accepted'
    ).length;
    const rejectedProposals = proposals.filter(
      (p) => p.status === 'rejected'
    ).length;

    return {
      activeContracts,
      completedContracts,
      totalEarned,
      inEscrow,
      pendingPayout,
      totalProposals: proposals.length,
      pendingProposals,
      shortlistedProposals,
      acceptedProposals,
      rejectedProposals,
    };
  }, [contracts, proposals]);

  /* ---------------- Derived: chart data ---------------- */
  const earningsData = useMemo(
    () => buildEarningsSeries(contracts),
    [contracts]
  );

  /* ---------------- Derived: recent proposals ---------------- */
  const recentProposals = useMemo(
    () =>
      [...proposals]
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        .slice(0, RECENT_PROPOSALS_LIMIT),
    [proposals]
  );

  /* ---------------- Fresh account ---------------- */
  const isFreshAccount =
    contracts.length === 0 && proposals.length === 0 && !profile?.headline;

  /* ---------------- Greeting ---------------- */
  const greetingName = useMemo(() => {
    const name = currentUser?.name || currentUser?.fullName;
    return name ? name.split(' ')[0] : 'Freelancer';
  }, [currentUser]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && contracts.length === 0 && proposals.length === 0) {
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
      <header className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl text-white shadow-soft bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
          }}
        />

        <div className="relative space-y-1.5 min-w-0">
          <Badge
            variant={profile?.isVerified ? 'success' : 'primary'}
            size="sm"
          >
            {profile?.isVerified ? 'Verified Pro' : 'Freelancer Portal'}
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {greetingName}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-2 flex-wrap">
            <UserIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="truncate max-w-[240px]" title={profile?.headline}>
              {profile?.headline || 'Complete your profile to attract more clients'}
            </span>
            {rating.total > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1">
                  <Star
                    className="w-3.5 h-3.5 text-amber-300"
                    aria-hidden="true"
                  />
                  <span className="font-bold text-white tabular-nums">
                    {rating.average.toFixed(1)}
                  </span>
                  <span className="text-emerald-200/80">
                    ({rating.total} review{rating.total === 1 ? '' : 's'})
                  </span>
                </span>
              </>
            )}
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          <Link to="/dashboard/freelancer/settings">
            <Button variant="secondary" size="md" className="font-bold shadow-md">
              {profile ? 'Edit Profile' : 'Create Profile'}
            </Button>
          </Link>
          <Link to="/projects">
            <Button
              variant="primary"
              size="md"
              icon={Search}
              className="font-bold shadow-md"
            >
              Find Projects
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
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <Sparkles
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Get started on SkillHire
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-pretty">
                Complete your profile and start bidding on projects. Most freelancers land their first contract within 2 weeks.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/dashboard/freelancer/settings">
                  <Button variant="primary" size="sm">
                    Complete Your Profile
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="sm" icon={Search}>
                    Browse Projects
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
          title="Total Earned"
          value={safeFormatCurrency(metrics.totalEarned)}
          change={
            metrics.pendingPayout > 0
              ? `${safeFormatCurrency(metrics.pendingPayout)} pending`
              : `${metrics.completedContracts} completed`
          }
          isPositive
          icon={IndianRupee}
          color="emerald"
          subtitle="From completed contracts"
        />
        <StatCard
          title="Active Contracts"
          value={metrics.activeContracts}
          change={`${metrics.completedContracts} completed`}
          isPositive={metrics.activeContracts > 0}
          icon={Clock}
          color="primary"
          subtitle="Currently in progress"
        />
        <StatCard
          title="Proposals"
          value={metrics.totalProposals}
          change={`${metrics.acceptedProposals} accepted`}
          isPositive={metrics.acceptedProposals > 0}
          icon={FileText}
          color="amber"
          subtitle={`${metrics.pendingProposals} pending review`}
        />
        <StatCard
          title="Average Rating"
          value={rating.total > 0 ? `${rating.average.toFixed(1)} ★` : '—'}
          change={
            rating.total > 0
              ? `${rating.total} review${rating.total === 1 ? '' : 's'}`
              : 'No reviews yet'
          }
          isPositive={rating.total > 0 && rating.average >= 4}
          icon={Star}
          color="purple"
          subtitle="Client feedback"
        />
      </section>

      {/* ============ Chart + Profile summary ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Revenue"
            subtitle="Earnings from completed contracts"
            action={
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg tabular-nums">
                {safeFormatCurrency(metrics.totalEarned)} Total
              </span>
            }
          >
            {contracts.filter((c) => c.status === 'completed').length === 0 ? (
              <div className="h-64 sm:h-72 flex items-center justify-center text-xs text-slate-400">
                No earnings yet — complete a contract to see your revenue here.
              </div>
            ) : (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={earningsData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`
                      }
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [
                        safeFormatCurrency(value),
                        'Earnings',
                      ]}
                    />
                    <Bar
                      dataKey="earnings"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Profile summary */}
        <aside className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Profile Summary
            </h2>
            <Shield className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>

          {profile ? (
            <dl className="space-y-3 text-xs">
              <SummaryRow
                label="Headline"
                value={profile.headline || 'Not set'}
              />
              <SummaryRow
                label="Hourly Rate"
                value={`${safeFormatCurrency(profile.hourlyRate)}/hr`}
                valueClass="tabular-nums"
              />
              <SummaryRow
                label="Availability"
                value={profile.availability?.status || 'Not set'}
                valueClass={`capitalize ${
                  profile.availability?.status === 'available'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              />
              <SummaryRow
                label="Experience"
                value={`${profile.experienceYears || 0} year${
                  profile.experienceYears === 1 ? '' : 's'
                }`}
              />
              <SummaryRow
                label="Skills"
                value={`${profile.skills?.length || 0} listed`}
                valueClass="tabular-nums"
              />

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link to="/dashboard/freelancer/settings" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    {profile.profileCompletion < 100
                      ? 'Complete Profile'
                      : 'Edit Profile'}
                  </Button>
                </Link>
              </div>
            </dl>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <UserIcon className="w-6 h-6 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-xs text-slate-400 text-pretty">
                You haven&apos;t set up your freelancer profile yet. Add your skills and rate to start getting noticed.
              </p>
              <Link to="/dashboard/freelancer/settings" className="block">
                <Button variant="primary" size="sm" className="w-full">
                  Create Profile
                </Button>
              </Link>
            </div>
          )}
        </aside>
      </section>

      {/* ============ Recent Proposals ============ */}
      {recentProposals.length > 0 && (
        <section
          aria-label="Recent proposals"
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Proposals
            </h2>
            <Link
              to="/dashboard/freelancer/proposals"
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <ul className="space-y-3">
            {recentProposals.map((proposal) => {
              const statusConfig = getProposalStatusConfig(proposal.status);
              const project = proposal.projectId;

              return (
                <li key={proposal._id}>
                  <Link
                    to={project?._id ? `/projects/${project._id}` : '#'}
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
                          title={project?.title}
                        >
                          {project?.title || 'Untitled Project'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge variant={statusConfig.variant} size="sm">
                            {statusConfig.label}
                          </Badge>
                          {proposal.deliveryDays > 0 && (
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {proposal.deliveryDays} day
                              {proposal.deliveryDays === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 tabular-nums">
                      {safeFormatCurrency(proposal.bidAmount)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ============ Quick actions ============ */}
      <section aria-label="Quick actions" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          to="/projects"
          icon={Search}
          title="Browse Projects"
          description="Find new freelance opportunities"
          tint="text-primary-600 dark:text-primary-400"
          bg="bg-primary-50 dark:bg-primary-950/40"
        />
        <QuickAction
          to="/dashboard/freelancer/proposals"
          icon={Briefcase}
          title="My Proposals"
          description="Track submitted bids"
          tint="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <QuickAction
          to="/dashboard/freelancer/earnings"
          icon={IndianRupee}
          title="Earnings & Payouts"
          description="Withdraw your balance"
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

function SummaryRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500 dark:text-slate-400 shrink-0">{label}</dt>
      <dd
        className={`font-semibold text-slate-900 dark:text-white text-right truncate max-w-[60%] ${valueClass}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
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
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}
      >
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default FreelancerDashboard;
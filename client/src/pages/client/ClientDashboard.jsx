import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { FreelancerCard } from '../../components/cards/FreelancerCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Briefcase,
  Users,
  CreditCard,
  FileText,
  FolderPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Shield
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function ClientDashboard() {
  const { currentUser } = useAuth();
  const { projects, proposals, contracts, freelancers, transactions } = useMarketplace();

  const clientProjects = projects.filter(p => p.clientId === currentUser?.id || p.clientId === 'usr-client-1');
  const activeProjects = clientProjects.filter(p => p.status === 'open' || p.status === 'in_progress');
  const completedProjects = clientProjects.filter(p => p.status === 'completed');

  const pendingProposals = proposals.filter(p => p.status === 'pending' || p.status === 'shortlisted');
  const totalSpent = currentUser?.totalSpent || 48500;

  // Chart spend data
  const spendData = [
    { month: 'Mar', spend: 4200 },
    { month: 'Apr', spend: 6800 },
    { month: 'May', spend: 5400 },
    { month: 'Jun', spend: 8900 },
    { month: 'Jul', spend: 11200 },
    { month: 'Aug', spend: 12000 }
  ];

  const recentActivities = [
    {
      id: 'act-1',
      type: 'proposal',
      title: 'New proposal received from Rahul Sharma',
      description: 'AI Observability Analytics Dashboard ($3,400 bid)',
      timestamp: '10m ago',
      link: `/dashboard/client/projects/proj-1/proposals`
    },
    {
      id: 'act-2',
      type: 'contract',
      title: 'Elena Rostova submitted Milestone 2 deliverable',
      description: 'FinTech Design System & Prototype',
      timestamp: '2h ago',
      link: `/dashboard/client/contracts/cntr-1`
    },
    {
      id: 'act-3',
      type: 'payment',
      title: '$1,400.00 escrow deposit confirmed',
      description: 'Milestone 2 Escrow Vault',
      timestamp: 'Yesterday',
      link: `/dashboard/client/payments`
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-soft">
        <div className="space-y-1">
          <Badge variant="primary" size="sm">Client Operations Hub</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Sarah'} 👋
          </h1>
          <p className="text-xs text-primary-200">
            {currentUser?.company || 'Nexus Innovations'} • You have <span className="font-bold text-white">{pendingProposals.length} proposals</span> awaiting review
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/client/projects/new">
            <Button variant="secondary" size="md" icon={FolderPlus} className="font-bold shadow-md">
              Post a Project
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          change="+2 this month"
          isPositive={true}
          icon={Briefcase}
          color="primary"
          subtitle="Currently in progress / open"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change="+18.4%"
          isPositive={true}
          icon={CreditCard}
          color="emerald"
          subtitle="Escrow + completed milestones"
        />
        <StatCard
          title="Pending Proposals"
          value={pendingProposals.length}
          change="3 shortlisted"
          isPositive={null}
          icon={FileText}
          color="amber"
          subtitle="Awaiting client decision"
        />
        <StatCard
          title="Completed Projects"
          value={completedProjects.length || 12}
          change="100% on time"
          isPositive={true}
          icon={CheckCircle2}
          color="purple"
          subtitle="Lifetime successfully closed"
        />
      </div>

      {/* Analytics Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Recharts Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Project Spend & Escrow"
            subtitle="Cumulative investment across all milestone contracts"
            action={<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">+24% vs Last Quarter</span>}
          >
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Spend']}
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
          </ChartCard>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <span className="text-xs text-slate-400">Real-time</span>
          </div>
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>

      {/* Active Projects Quick Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Active Projects</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Open for proposals and ongoing contracts</p>
          </div>
          <Link
            to="/dashboard/client/projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientProjects.slice(0, 2).map((proj) => (
            <div
              key={proj.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="primary" size="sm">{proj.category}</Badge>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(proj.budget)}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {proj.proposalsCount || 0} Proposals received
                </span>
                <Link to={`/dashboard/client/projects/${proj.id}/proposals`}>
                  <Button variant="primary" size="sm">
                    Manage Proposals ({proj.proposalsCount || 0})
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Freelancers Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recommended Top Talent</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Specialists matched to your active project scopes</p>
          </div>
          <Link
            to="/freelancers"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>Browse All Talent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelancers.slice(0, 3).map((fl) => (
            <FreelancerCard key={fl.id} freelancer={fl} />
          ))}
        </div>
      </div>
    </div>
  );
}

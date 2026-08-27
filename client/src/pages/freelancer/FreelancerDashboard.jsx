import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { ContractCard } from '../../components/cards/ContractCard';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  Briefcase,
  Award,
  CheckCircle2,
  Search,
  ArrowRight,
  TrendingUp,
  FileText,
  Star,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function FreelancerDashboard() {
  const { currentUser } = useAuth();
  const { contracts, proposals, projects } = useMarketplace();

  const freelancerContracts = contracts.filter(c => c.freelancerId === 'fl-1' || c.freelancerUserId === currentUser?.id);
  const activeContracts = freelancerContracts.filter(c => c.status !== 'completed');
  const freelancerProposals = proposals.filter(p => p.freelancerId === 'fl-1' || p.freelancerUserId === currentUser?.id);
  const pendingBids = freelancerProposals.filter(p => p.status === 'pending' || p.status === 'shortlisted');

  // Recharts monthly revenue
  const earningsData = [
    { month: 'Mar', earnings: 5200 },
    { month: 'Apr', earnings: 7400 },
    { month: 'May', earnings: 6800 },
    { month: 'Jun', earnings: 9500 },
    { month: 'Jul', earnings: 11800 },
    { month: 'Aug', earnings: 14200 }
  ];

  const recentActivities = [
    {
      id: 'fl-act-1',
      type: 'contract',
      title: 'Hired on "Real-time AI Document Assistant"',
      description: '$3,800 milestone funded into escrow',
      timestamp: 'Today',
      link: '/dashboard/freelancer/contracts'
    },
    {
      id: 'fl-act-2',
      type: 'proposal',
      title: 'Proposal shortlisted by Nexus Innovations',
      description: 'AI Observability Dashboard',
      timestamp: 'Yesterday',
      link: '/dashboard/freelancer/proposals'
    },
    {
      id: 'fl-act-3',
      type: 'payment',
      title: '$3,610.00 payout transferred to Bank Account',
      description: 'Milestone completion payout',
      timestamp: 'Aug 15',
      link: '/dashboard/freelancer/earnings'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-soft">
        <div className="space-y-1">
          <Badge variant="success" size="sm">Senior Pro Portal</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Rahul'} 👋
          </h1>
          <p className="text-xs text-emerald-200">
            Job Success: <span className="font-bold text-white">99%</span> • You have <span className="font-bold text-white">{activeContracts.length} active contracts</span> in progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="secondary" size="md" icon={Search} className="font-bold shadow-md">
              Find New Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Lifetime Earnings"
          value={formatCurrency(currentUser?.totalEarned || 84200)}
          change="+24% YoY"
          isPositive={true}
          icon={DollarSign}
          color="emerald"
          subtitle="Net payouts received"
        />
        <StatCard
          title="Active Contracts"
          value={activeContracts.length || 2}
          change="All milestones on track"
          isPositive={true}
          icon={Briefcase}
          color="primary"
          subtitle="In active development"
        />
        <StatCard
          title="Submitted Proposals"
          value={freelancerProposals.length || 4}
          change={`${pendingBids.length} in review`}
          isPositive={null}
          icon={FileText}
          color="amber"
          subtitle="Active project bids"
        />
        <StatCard
          title="Average Rating"
          value="4.96 ★"
          change="52 Verified reviews"
          isPositive={true}
          icon={Star}
          color="purple"
          subtitle="Top 1% rated talent"
        />
      </div>

      {/* Earnings Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Recharts Bar Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Revenue Performance"
            subtitle="Verified milestone earnings released to available balance"
            action={<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">Avg $9,150/mo</span>}
          >
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
                  />
                  <Bar
                    dataKey="earnings"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
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

      {/* Active Workspaces / Contracts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Workspaces & Milestones</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Contracts requiring deliverables or in review</p>
          </div>
          <Link
            to="/dashboard/freelancer/contracts"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>All Contracts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {freelancerContracts.slice(0, 2).map((contract) => (
            <ContractCard key={contract.id} contract={contract} role="freelancer" />
          ))}
        </div>
      </div>

      {/* Matching Jobs Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Jobs Matched to Your Skills (95%+ Match)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">High-budget opportunities fitting your React, Node.js, and AI background</p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </div>
    </div>
  );
}

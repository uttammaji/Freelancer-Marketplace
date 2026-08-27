import React from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DisputeCard } from '../../components/cards/DisputeCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import {
  Shield,
  Users,
  Briefcase,
  DollarSign,
  Scale,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
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
  ResponsiveContainer
} from 'recharts';

export function AdminDashboard() {
  const { usersList, projects, contracts, disputes, transactions } = useMarketplace();

  const openDisputes = disputes.filter(d => d.status === 'open');
  const totalVolume = 184500.00;
  const platformRevenue = totalVolume * 0.05; // $9,225 take rate

  // Growth data
  const revenueGrowthData = [
    { month: 'Mar', gmv: 42000, revenue: 2100 },
    { month: 'Apr', gmv: 68000, revenue: 3400 },
    { month: 'May', gmv: 85000, revenue: 4250 },
    { month: 'Jun', gmv: 110000, revenue: 5500 },
    { month: 'Jul', gmv: 145000, revenue: 7250 },
    { month: 'Aug', gmv: 184500, revenue: 9225 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-white shadow-soft">
        <div className="space-y-1">
          <Badge variant="purple" size="sm">Executive Control Plane</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SkillHire Platform Operations
          </h1>
          <p className="text-xs text-purple-200">
            Real-time platform GMV, dispute arbitrations, escrow security & moderation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/disputes">
            <Button variant="danger" size="sm" icon={Scale}>
              {openDisputes.length} Active Disputes
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Platform GMV (Volume)"
          value={formatCurrency(totalVolume)}
          change="+28% MoM"
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
          subtitle="Total transacted across marketplace"
        />
        <StatCard
          title="Platform Revenue (5%)"
          value={formatCurrency(platformRevenue)}
          change="Net platform fees"
          isPositive={true}
          icon={DollarSign}
          color="purple"
          subtitle="Automated take rate"
        />
        <StatCard
          title="Total Registered Users"
          value={usersList.length || 18}
          change="+12 this week"
          isPositive={true}
          icon={Users}
          color="primary"
          subtitle="Clients, freelancers, admins"
        />
        <StatCard
          title="Open Dispute Cases"
          value={openDisputes.length}
          change={openDisputes.length > 0 ? 'Requires arbitration' : 'Zero disputes'}
          isPositive={openDisputes.length === 0}
          icon={Scale}
          color="rose"
          subtitle="Escrow mediation queue"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GMV Growth */}
        <ChartCard
          title="Monthly Platform GMV & Volume"
          subtitle="Gross marketplace merchandise value in USD"
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333EA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Total GMV']}
                />
                <Area type="monotone" dataKey="gmv" stroke="#9333EA" strokeWidth={3} fill="url(#gmvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 5% Fee Revenue */}
        <ChartCard
          title="Net 5% Commission Revenue"
          subtitle="SkillHire platform income after escrow releases"
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Platform Revenue']}
                />
                <Bar dataKey="revenue" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Urgent Dispute Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Dispute Resolution Center</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Escrow conflicts requiring administrator decision</p>
          </div>
          <Link to="/admin/disputes" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
            View All Disputes
          </Link>
        </div>

        <div className="space-y-4">
          {disputes.slice(0, 2).map((disp) => (
            <DisputeCard key={disp.id} dispute={disp} />
          ))}
        </div>
      </div>
    </div>
  );
}

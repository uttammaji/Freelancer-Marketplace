// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  IndianRupee,
  Scale,
  TrendingUp,
  Loader2,
  Briefcase,
  CheckCircle2,
  Clock,
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
  const { currentUser } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState({
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
  });
  const [recentDisputes, setRecentDisputes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    
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

      const totalFreelancers = freelancersRes.total || 0;
      const totalClients = clientsRes.total || 0;
      const totalProjects = projectsRes.total || 0;
      const totalUsers = totalFreelancers + totalClients;

      const totalVolume = platformStatsRes.stats?.totalVolume || contractStatsRes.stats?.totalEarnings || 0;
      const totalTransactions = platformStatsRes.stats?.totalTransactions || 0;

      setStats({
        totalUsers,
        totalFreelancers,
        totalClients,
        totalProjects,
        openDisputes: disputeStatsRes.stats?.open || 0,
        totalDisputes: disputeStatsRes.stats?.total || 0,
        activeContracts: contractStatsRes.stats?.active || 0,
        completedContracts: contractStatsRes.stats?.completed || 0,
        totalVolume,
        totalTransactions,
      });

      if (disputesRes.success) {
        setRecentDisputes(disputesRes.disputes || []);
      }

      // Generate REAL chart data from projects
      const realChartData = generateChartData(projectsRes.projects || [], totalVolume);
      setChartData(realChartData);

    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Load Failed', 'Could not load dashboard stats.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /**
   * Generate real chart data from actual projects
   */
  const generateChartData = (projects, totalVolume) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().slice(0, 7);
      
      // Calculate real GMV for this month from projects
      const monthProjects = projects.filter(p => {
        const projectDate = new Date(p.createdAt);
        return projectDate.toISOString().slice(0, 7) === monthKey;
      });

      const monthGMV = monthProjects.reduce((sum, p) => sum + (p.budget?.max || p.budget?.min || 0), 0);
      const monthRevenue = Math.round(monthGMV * 0.05);

      data.push({
        month: months[monthDate.getMonth()],
        gmv: monthGMV,
        revenue: monthRevenue,
      });
    }

    return data;
  };

  const platformRevenue = Math.round(stats.totalVolume * 0.05);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading platform operations...</p>
        </div>
      </div>
    );
  }

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
            Real-time platform stats, dispute arbitrations & escrow security
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/disputes">
            <Button variant="danger" size="sm" icon={Scale}>
              {stats.openDisputes} Active Disputes
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Platform GMV"
          value={formatCurrency(stats.totalVolume)}
          change={`${stats.totalTransactions} transactions`}
          isPositive={true}
          icon={IndianRupee}
          color="emerald"
          subtitle="Real transaction volume"
        />
        <StatCard
          title="Platform Revenue (5%)"
          value={formatCurrency(platformRevenue)}
          change="Net platform fees"
          isPositive={true}
          icon={TrendingUp}
          color="purple"
          subtitle="Automated take rate"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={`${stats.totalFreelancers} freelancers • ${stats.totalClients} clients`}
          isPositive={true}
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
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <Briefcase className="w-4 h-4 text-primary-600 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Total Projects</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.totalProjects}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Active Contracts</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.activeContracts}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Completed</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.completedContracts}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <Scale className="w-4 h-4 text-rose-600 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Total Disputes</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.totalDisputes}</span>
        </div>
      </div>

      {/* Charts — REAL DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Platform GMV"
          subtitle="Real project volume by month"
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333EA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'GMV']}
                />
                <Area type="monotone" dataKey="gmv" stroke="#9333EA" strokeWidth={3} fill="url(#gmvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Platform Commission (5%)"
          subtitle="Real revenue from platform fees"
        >
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Recent Disputes */}
      {recentDisputes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Recent Disputes</span>
              </h2>
            </div>
            <Link to="/admin/disputes" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentDisputes.slice(0, 2).map((dispute) => (
              <DisputeCard
                key={dispute._id}
                dispute={{
                  id: dispute._id,
                  reason: dispute.reason,
                  description: dispute.description,
                  status: dispute.status,
                  projectTitle: dispute.projectId?.title || 'Project',
                  openedByName: dispute.openedBy?.name || 'User',
                  againstName: dispute.against?.name || 'User',
                  createdAt: dispute.createdAt,
                }}
                isAdminView={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
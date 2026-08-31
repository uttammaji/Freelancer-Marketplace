// client/src/pages/client/ClientDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { formatCurrency } from '../../utils/formatters';
import {
  Briefcase,
  CreditCard,
  CheckCircle2,
  FolderPlus,
  Users,
  Loader2,
  Building,
  TrendingUp,
  Clock,
  FileText,
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
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [profileRes, projectsRes, contractsRes] = await Promise.all([
        getMyProfile(),
        getMyProjects(),
        getClientContracts(),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.profile);
      }

      if (projectsRes.success) {
        setProjects(projectsRes.projects || []);
      }

      if (contractsRes.success) {
        setContracts(contractsRes.contracts || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Silent fail - dashboard shows zeros
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate real stats
  const activeProjects = projects.filter(p => p.status === 'open').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const totalSpent = contracts.reduce((sum, c) => sum + (c.amount || 0), 0);
  const freelancersHired = contracts.filter(c => c.freelancerId).length;

  // Spend data for chart (last 6 months)
  const spendData = generateSpendData(contracts);

  function generateSpendData(contractsList) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM
      const monthSpend = contractsList
        .filter(c => {
          const contractDate = c.createdAt ? new Date(c.createdAt) : null;
          return contractDate && contractDate.toISOString().slice(0, 7) === monthKey;
        })
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      data.push({
        month: months[monthDate.getMonth()],
        spend: monthSpend,
      });
    }

    return data;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-soft">
        <div className="space-y-1">
          <Badge variant="primary" size="sm">Client Operations Hub</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Client'}
          </h1>
          <p className="text-xs text-primary-200">
            {profile?.companyName || 'Your Company'} • {profile?.industry || 'Add your industry'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/client/settings">
            <Button variant="secondary" size="md" className="font-bold shadow-md">
              {profile ? 'Edit Profile' : 'Create Profile'}
            </Button>
          </Link>
          <Link to="/dashboard/client/projects/new">
            <Button variant="primary" size="md" icon={FolderPlus} className="font-bold shadow-md">
              Post Project
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Projects"
          value={projects.length}
          change={`${activeProjects} open`}
          isPositive={activeProjects > 0}
          icon={Briefcase}
          color="primary"
          subtitle="All-time projects"
        />
        <StatCard
          title="Active Contracts"
          value={activeContracts}
          change={`${inProgressProjects} in progress`}
          isPositive={activeContracts > 0}
          icon={Clock}
          color="amber"
          subtitle="Currently active"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change="Lifetime"
          isPositive={true}
          icon={CreditCard}
          color="emerald"
          subtitle="Across all contracts"
        />
        <StatCard
          title="Freelancers Hired"
          value={freelancersHired}
          change={`${completedContracts} completed`}
          isPositive={completedContracts > 0}
          icon={Users}
          color="purple"
          subtitle="Unique freelancers"
        />
      </div>

      {/* Chart + Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Project Spend"
            subtitle="Real spending from your contracts"
            action={
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                {formatCurrency(totalSpent)} Total
              </span>
            }
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

        {/* Profile Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Summary</h3>
          
          {profile ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {profile.companyName || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Industry</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.industry || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Website</span>
                <span className="font-semibold text-primary-600 truncate max-w-[150px]">
                  {profile.website || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {[profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Projects Posted</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.projectsPosted || projects.length}
                </span>
              </div>

              <Link to="/dashboard/client/settings">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  {profile.companyName ? 'Edit Profile' : 'Create Profile'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 mb-4">You haven't created your company profile yet.</p>
              <Link to="/dashboard/client/settings">
                <Button variant="primary" size="md">
                  Create Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Projects</h3>
            <Link to="/dashboard/client/projects" className="text-xs font-bold text-primary-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{project.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      {project.proposalCount || 0} proposals • {project.status}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                  {formatCurrency(project.budget?.min || 0)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/client/projects/new" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors">
          <FolderPlus className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Post Project</h3>
          <p className="text-xs text-slate-500 mt-1">Create a new project listing</p>
        </Link>

        <Link to="/dashboard/client/projects" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors">
          <Briefcase className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Projects</h3>
          <p className="text-xs text-slate-500 mt-1">Manage your project listings</p>
        </Link>

        <Link to="/freelancers" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors">
          <Users className="w-8 h-8 text-amber-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Find Freelancers</h3>
          <p className="text-xs text-slate-500 mt-1">Browse talent directory</p>
        </Link>
      </div>
    </div>
  );
}

export default ClientDashboard;
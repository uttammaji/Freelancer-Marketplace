// client/src/pages/client/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FreelancerCardSkeleton } from '../../components/common/SkeletonLoader';
import { formatCurrency } from '../../utils/formatters';
import {
  Briefcase,
  CreditCard,
  FileText,
  CheckCircle2,
  FolderPlus,
  ArrowRight,
  Building,
  Loader2,
  Users
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
  const { currentUser, profile, fetchProfile, isProfileLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchProfile();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Mock spend data (replace with real API later)
  const spendData = [
    { month: 'Mar', spend: 4200 },
    { month: 'Apr', spend: 6800 },
    { month: 'May', spend: 5400 },
    { month: 'Jun', spend: 8900 },
    { month: 'Jul', spend: 11200 },
    { month: 'Aug', spend: profile?.totalSpent || 12000 }
  ];

  // Loading state
  if (isLoading || isProfileLoading) {
    return (
      <div className="space-y-8">
        <FreelancerCardSkeleton className="h-32 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <FreelancerCardSkeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <FreelancerCardSkeleton className="h-64 rounded-2xl" />
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
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Client'} 👋
          </h1>
          <p className="text-xs text-primary-200">
            {profile?.companyName || 'Your Company'} • 
            {' '}{profile?.industry || 'Add your industry'}
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
          title="Projects Posted"
          value={profile?.projectsPosted || 0}
          change="Total"
          isPositive={true}
          icon={Briefcase}
          color="primary"
          subtitle="Lifetime projects"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(profile?.totalSpent || 0)}
          change="Lifetime"
          isPositive={true}
          icon={CreditCard}
          color="emerald"
          subtitle="Escrow + completed"
        />
        <StatCard
          title="Freelancers Hired"
          value={profile?.totalHired || 0}
          change="Total"
          isPositive={true}
          icon={Users}
          color="amber"
          subtitle="Successful contracts"
        />
        <StatCard
          title="Company"
          value={profile?.companyName || 'Not Set'}
          change={profile?.industry || 'Add industry'}
          isPositive={true}
          icon={Building}
          color="purple"
          subtitle="Your organization"
        />
      </div>

      {/* Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Project Spend"
            subtitle="Cumulative investment across projects"
            action={
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                ${profile?.totalSpent || 0} Total
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
                  {profile.location?.city || 'Not set'}
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
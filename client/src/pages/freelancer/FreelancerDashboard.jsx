// client/src/pages/freelancer/FreelancerDashboard.jsx
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
  DollarSign,
  Briefcase,
  Award,
  CheckCircle2,
  Search,
  ArrowRight,
  Star,
  Loader2,
  Clock,
  TrendingUp
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

  // Mock earnings data (replace with real API later)
  const earningsData = [
    { month: 'Mar', earnings: 5200 },
    { month: 'Apr', earnings: 7400 },
    { month: 'May', earnings: 6800 },
    { month: 'Jun', earnings: 9500 },
    { month: 'Jul', earnings: 11800 },
    { month: 'Aug', earnings: profile?.totalEarnings || 14200 }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-soft">
        <div className="space-y-1">
          <Badge variant="success" size="sm">
            {profile?.isVerified ? 'Verified Pro' : 'Freelancer Portal'}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Freelancer'} 👋
          </h1>
          <p className="text-xs text-emerald-200">
            {profile?.headline || 'Complete your profile to get started'} • 
            {' '}Rating: <span className="font-bold text-white">{profile?.rating?.average || 0} ★</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/freelancer/settings">
            <Button variant="secondary" size="md" className="font-bold shadow-md">
              {profile ? 'Edit Profile' : 'Create Profile'}
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="primary" size="md" icon={Search} className="font-bold shadow-md">
              Find Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(profile?.totalEarnings || 0)}
          change="Lifetime"
          isPositive={true}
          icon={DollarSign}
          color="emerald"
          subtitle="Net payouts received"
        />
        <StatCard
          title="Completed Projects"
          value={profile?.completedProjects || 0}
          change="Contracts"
          isPositive={true}
          icon={Briefcase}
          color="primary"
          subtitle="Successfully delivered"
        />
        <StatCard
          title="Average Rating"
          value={`${profile?.rating?.average || 0} ★`}
          change={`${profile?.rating?.count || 0} reviews`}
          isPositive={true}
          icon={Star}
          color="purple"
          subtitle="Client feedback"
        />
        <StatCard
          title="Experience"
          value={`${profile?.experienceYears || 0} Years`}
          change="Professional"
          isPositive={true}
          icon={Award}
          color="amber"
          subtitle="Industry experience"
        />
      </div>

      {/* Earnings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Revenue Performance"
            subtitle="Verified milestone earnings released"
            action={
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                Avg ${Math.round((profile?.totalEarnings || 0) / 6)}/mo
              </span>
            }
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
                  <Bar dataKey="earnings" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Profile Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Summary</h3>
          
          {profile ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Headline</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {profile.headline || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hourly Rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${profile.hourlyRate}/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Availability</span>
                <span className={`font-semibold capitalize ${
                  profile.availability?.status === 'available' 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
                }`}>
                  {profile.availability?.status || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.location?.city || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profile Completion</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.profileCompletion || 0}%
                </span>
              </div>

              <Link to="/dashboard/freelancer/settings">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Complete Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 mb-4">You haven't created your profile yet.</p>
              <Link to="/dashboard/freelancer/settings">
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
        <Link to="/projects" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors">
          <Search className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Browse Projects</h3>
          <p className="text-xs text-slate-500 mt-1">Find new freelance opportunities</p>
        </Link>

        <Link to="/dashboard/freelancer/proposals" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors">
          <Briefcase className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Proposals</h3>
          <p className="text-xs text-slate-500 mt-1">Track your submitted bids</p>
        </Link>

        <Link to="/dashboard/freelancer/settings" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors">
          <Star className="w-8 h-8 text-amber-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Settings</h3>
          <p className="text-xs text-slate-500 mt-1">Update your professional profile</p>
        </Link>
      </div>
    </div>
  );
}
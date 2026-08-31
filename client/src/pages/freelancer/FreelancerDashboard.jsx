// client/src/pages/freelancer/FreelancerDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile } from "../../services/profile.service";
import { getMyProposals } from "../../services/proposal.service";
import { getFreelancerContracts } from "../../services/contract.service";
import { getReviewSummary } from "../../services/review.service";
import { StatCard } from "../../components/dashboard/StatCard";
import { ChartCard } from "../../components/dashboard/ChartCard";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { formatCurrency } from "../../utils/formatters";
import {
  DollarSign,
  Briefcase,
  Award,
  Search,
  Star,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function FreelancerDashboard() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = currentUser?.id || currentUser?._id;
  const averageRating =
    ratingSummary?.averageRating ?? profile?.rating?.average ?? 0;
  const totalReviews =
    ratingSummary?.totalReviews ?? profile?.rating?.count ?? 0;

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

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

      if (profileRes.success) {
        setProfile(profileRes.profile);
      }

      if (proposalsRes.success) {
        setProposals(proposalsRes.proposals || []);
      }

      if (contractsRes.success) {
        setContracts(contractsRes.contracts || []);
      }

      if (reviewSummaryRes?.success) {
        setRatingSummary(reviewSummaryRes.summary);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Silent fail - dashboard shows zeros
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate real stats
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const completedContracts = contracts.filter(
    (c) => c.status === "completed",
  ).length;
  const pendingProposals = proposals.filter(
    (p) => p.status === "pending",
  ).length;
  const shortlistedProposals = proposals.filter(
    (p) => p.status === "shortlisted",
  ).length;
  const acceptedProposals = proposals.filter(
    (p) => p.status === "accepted",
  ).length;

  const totalEarnings = contracts.reduce((sum, c) => {
    return sum + (c.freelancerAmount || c.amount || 0);
  }, 0);

  // Generate earnings data from contracts (last 6 months)
  const generateEarningsData = (contractsList) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().slice(0, 7);
      const monthEarnings = contractsList
        .filter((c) => {
          const contractDate = c.completedAt || c.createdAt;
          return (
            contractDate &&
            new Date(contractDate).toISOString().slice(0, 7) === monthKey
          );
        })
        .reduce((sum, c) => sum + (c.freelancerAmount || c.amount || 0), 0);

      data.push({
        month: months[monthDate.getMonth()],
        earnings: monthEarnings,
      });
    }

    return data;
  };

  const earningsData = generateEarningsData(contracts);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-soft">
        <div className="space-y-1">
          <Badge variant="success" size="sm">
            {profile?.isVerified ? "Verified Pro" : "Freelancer Portal"}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(" ")[0] || "Freelancer"}
          </h1>
          <p className="text-xs text-emerald-200">
            {profile?.headline || "Complete your profile to get started"} •
            Rating:{" "}
            <span className="font-bold text-white">
              {Number(averageRating || 0).toFixed(1)} ★ ({totalReviews} reviews)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/freelancer/settings">
            <Button
              variant="secondary"
              size="md"
              className="font-bold shadow-md"
            >
              {profile ? "Edit Profile" : "Create Profile"}
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
      </div>

      {/* 4 Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          change="Lifetime"
          isPositive={true}
          icon={DollarSign}
          color="emerald"
          subtitle="From completed contracts"
        />
        <StatCard
          title="Active Contracts"
          value={activeContracts}
          change={`${completedContracts} completed`}
          isPositive={activeContracts > 0}
          icon={Clock}
          color="primary"
          subtitle="Currently active"
        />
        <StatCard
          title="Proposals"
          value={proposals.length}
          change={`${acceptedProposals} accepted • ${shortlistedProposals} shortlisted`}
          isPositive={acceptedProposals > 0}
          icon={FileText}
          color="amber"
          subtitle={`${pendingProposals} pending review`}
        />
        <StatCard
          title="Average Rating"
          value={`${Number(averageRating || 0).toFixed(1)} ★`}
          change={`${totalReviews} reviews`}
          isPositive={true}
          icon={Star}
          color="purple"
          subtitle="Client feedback"
        />
      </div>

      {/* Earnings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Revenue Performance"
            subtitle="Earnings from completed contracts"
            action={
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                {formatCurrency(totalEarnings)} Total
              </span>
            }
          >
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
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#FFF",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Earnings",
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
          </ChartCard>
        </div>

        {/* Profile Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Profile Summary
          </h3>

          {profile ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Headline</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {profile.headline || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hourly Rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${profile.hourlyRate || 0}/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Availability</span>
                <span
                  className={`font-semibold capitalize ${
                    profile.availability?.status === "available"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {profile.availability?.status || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.experienceYears || 0} Years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Skills</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.skills?.length || 0} Skills
                </span>
              </div>

              <Link to="/dashboard/freelancer/settings">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  {profile.profileCompletion < 100
                    ? "Complete Profile"
                    : "Edit Profile"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 mb-4">
                You haven't created your profile yet.
              </p>
              <Link to="/dashboard/freelancer/settings">
                <Button variant="primary" size="md">
                  Create Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Proposals */}
      {proposals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Proposals
            </h3>
            <Link
              to="/dashboard/freelancer/proposals"
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {proposals.slice(0, 3).map((proposal) => {
              const project = proposal.projectId;
              return (
                <Link
                  key={proposal._id}
                  to={`/projects/${project?._id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {project?.title || "Project"}
                      </h4>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {proposal.status} • {proposal.deliveryDays} days
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                    {formatCurrency(proposal.bidAmount)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/projects"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors"
        >
          <Search className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Browse Projects
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Find new freelance opportunities
          </p>
        </Link>

        <Link
          to="/dashboard/freelancer/proposals"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors"
        >
          <Briefcase className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            My Proposals
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Track your submitted bids
          </p>
        </Link>

        <Link
          to="/dashboard/freelancer/settings"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft hover:border-primary-400 transition-colors"
        >
          <Star className="w-8 h-8 text-amber-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Profile Settings
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Update your professional profile
          </p>
        </Link>
      </div>
    </div>
  );
}

export default FreelancerDashboard;

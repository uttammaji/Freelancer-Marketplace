// client/src/pages/admin/ManageUsersPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  getAllFreelancers,
  getAllClients,
  updateAvailability,
} from '../../services/profile.service';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Eye,
  Shield,
  RefreshCw,
  AlertCircle,
  Search,
  Star,
  Ban,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  IndianRupee,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 300;

const ROLE_FILTERS = [
  { value: 'all',        label: 'All Roles' },
  { value: 'client',     label: 'Clients' },
  { value: 'freelancer', label: 'Freelancers' },
];

const STATUS_FILTERS = [
  { value: 'all',       label: 'All Statuses' },
  { value: 'active',    label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const safeFormatCurrency = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  try {
    return formatCurrency(n);
  } catch {
    return `₹${n.toLocaleString('en-IN')}`;
  }
};

const safeFormatDate = (d) => {
  if (!d) return '—';
  try {
    return formatDate ? formatDate(d) : new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
};

/** Normalise a freelancer or client API profile into one shape. */
function normaliseUser(profile, role) {
  const u = profile.userId || {};
  const id = typeof profile.userId === 'object' ? u._id : profile.userId;

  return {
    id,
    name: u.name || (role === 'freelancer' ? 'Freelancer' : 'Client'),
    email: u.email || '',
    avatar: u.avatar || '',
    role,
    status: u.status || 'active',

    // shared
    location: profile.location?.country || u.location?.country || 'Global',
    memberSince: profile.createdAt || u.createdAt,
    isVerified: Boolean(profile.isVerified),

    // freelancer-specific
    headline: profile.headline || '',
    hourlyRate: Number(profile.hourlyRate) || 0,
    totalEarned: Number(profile.totalEarnings) || 0,
    rating: Number(profile.rating?.average) || 0,
    reviewsCount: Number(profile.rating?.count) || 0,

    // client-specific
    companyName: profile.companyName || '',
    totalSpent: Number(profile.totalSpent) || 0,
    projectsPosted: Number(profile.projectsPosted) || 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ManageUsersPage() {
  const toast = useToast();

  /* ---------- Data ---------- */
  const [users, setUsers] = useState([]);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ---------- UI ---------- */
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Modals ---------- */
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null); // { user, nextStatus }
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  /* ---------------- Debounce search ---------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */
  const fetchUsers = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);

      try {
        const [freelancersRes, clientsRes] = await Promise.all([
          getAllFreelancers({ limit: PAGE_SIZE }),
          getAllClients({ limit: PAGE_SIZE }),
        ]);

        const all = [];

        if (freelancersRes?.success) {
          for (const p of freelancersRes.profiles || []) {
            all.push(normaliseUser(p, 'freelancer'));
          }
        }

        if (clientsRes?.success) {
          for (const p of clientsRes.profiles || []) {
            all.push(normaliseUser(p, 'client'));
          }
        }

        setUsers(all);

        if (silent) {
          toast.success('Refreshed', 'User directory is up to date.');
        }
      } catch (error) {
        console.error('[ManageUsers] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          setUsers([]);
          toast.error('Load Failed', 'Could not load users.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ---------------- Derived ---------------- */
  const counts = useMemo(() => {
    return {
      all: users.length,
      clients: users.filter((u) => u.role === 'client').length,
      freelancers: users.filter((u) => u.role === 'freelancer').length,
      suspended: users.filter((u) => u.status === 'suspended').length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.companyName?.toLowerCase().includes(q) ||
        u.headline?.toLowerCase().includes(q)
      );
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(debouncedSearch) ||
      roleFilter !== 'all' ||
      statusFilter !== 'all',
    [debouncedSearch, roleFilter, statusFilter]
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
  }, []);

  /* ---------------- Status toggle ---------------- */
  const requestStatusToggle = useCallback((user) => {
    setStatusTarget({
      user,
      nextStatus: user.status === 'suspended' ? 'active' : 'suspended',
    });
  }, []);

  const confirmStatusToggle = useCallback(async () => {
    if (!statusTarget) return;

    const { user, nextStatus } = statusTarget;
    const previousStatus = user.status;
    const snapshot = users;

    setIsUpdatingStatus(true);
    setStatusTarget(null);

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    try {
      const res = await updateUserStatus?.(user.id, nextStatus);
      if (res && !res.success) {
        throw new Error(res.message || 'Failed to update status');
      }

      toast.success(
        nextStatus === 'suspended' ? 'User Suspended' : 'User Reactivated',
        `${user.name} is now ${nextStatus}.`
      );
    } catch (error) {
      console.error('[ManageUsers] status update failed:', error);
      // Rollback
      setUsers(snapshot);
      toast.error(
        'Update Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Could not update user status.'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [statusTarget, users, toast]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading && users.length === 0) {
    return <UsersSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && users.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load users"
          description="We hit a snag reaching the user directory. Try again in a moment."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchUsers()}
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
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">
            User Directory & RBAC
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Platform Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {counts.all.toLocaleString()}
            </span>{' '}
            account{counts.all === 1 ? '' : 's'} registered
            {counts.suspended > 0 && (
              <>
                {' '}· <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {counts.suspended} suspended
                </span>
              </>
            )}
            .
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => fetchUsers({ silent: true })}
          disabled={isRefreshing}
          aria-label="Refresh users"
          className={isRefreshing ? 'animate-pulse' : ''}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
        <div className="flex-1 lg:max-w-md">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or headline…"
            aria-label="Search users"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role tabs */}
          <div
            className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950"
            role="tablist"
            aria-label="Filter by role"
          >
            {ROLE_FILTERS.map((tab) => {
              const isActive = roleFilter === tab.value;
              const count =
                tab.value === 'all'
                  ? counts.all
                  : tab.value === 'client'
                  ? counts.clients
                  : counts.freelancers;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status select */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                         rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                         cursor-pointer"
            >
              {STATUS_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredUsers.length > 0 ? (
        <>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">
              Showing {filteredUsers.length} of {counts.all} user
              {counts.all === 1 ? '' : 's'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <caption className="sr-only">
                  Platform user directory with role, status, and volume
                </caption>
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">User</th>
                    <th scope="col" className="px-6 py-4">Role</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Volume</th>
                    <th scope="col" className="px-6 py-4">Member Since</th>
                    <th scope="col" className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={() => setSelectedUser(user)}
                      onToggleStatus={() => requestStatusToggle(user)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : hasActiveFilters ? (
        <EmptyState
          icon={Search}
          title="No matching users"
          description="Nothing matched your current filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Platform accounts will appear here as users register."
        />
      )}

      {/* User details modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={() => {
            setSelectedUser(null);
            requestStatusToggle(selectedUser);
          }}
        />
      )}

      {/* Status change confirmation */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => !isUpdatingStatus && setStatusTarget(null)}
        onConfirm={confirmStatusToggle}
        title={
          statusTarget?.nextStatus === 'suspended'
            ? 'Suspend User?'
            : 'Reactivate User?'
        }
        description={
          statusTarget
            ? statusTarget.nextStatus === 'suspended'
              ? `Suspending ${statusTarget.user.name} will immediately prevent them from logging in, sending messages, and receiving payouts. Active contracts will remain but no new work can start until reactivated.`
              : `Reactivating ${statusTarget.user.name} will restore full platform access immediately.`
            : ''
        }
        confirmLabel={
          isUpdatingStatus
            ? 'Processing…'
            : statusTarget?.nextStatus === 'suspended'
            ? 'Suspend User'
            : 'Reactivate User'
        }
        variant={
          statusTarget?.nextStatus === 'suspended' ? 'danger' : 'primary'
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Row component                                                      */
/* ------------------------------------------------------------------ */
const UserRow = React.memo(function UserRow({ user, onView, onToggleStatus }) {
  const isSuspended = user.status === 'suspended';
  return (
    <tr
      className={`hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
        isSuspended ? 'opacity-60' : ''
      }`}
    >
      {/* User */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="truncate max-w-[180px]" title={user.name}>
                {user.name}
              </span>
              {user.isVerified && (
                <Shield
                  className="w-3 h-3 text-emerald-500 shrink-0"
                  aria-label="Verified"
                />
              )}
            </span>
            <span
              className="text-slate-400 text-[11px] truncate block max-w-[200px]"
              title={user.email}
            >
              {user.email}
            </span>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <Badge
          variant={user.role === 'client' ? 'primary' : 'success'}
          size="sm"
        >
          {user.role === 'client' ? 'Client' : 'Freelancer'}
        </Badge>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge
          variant={isSuspended ? 'danger' : 'success'}
          size="sm"
          dot
        >
          {isSuspended ? 'Suspended' : 'Active'}
        </Badge>
      </td>

      {/* Volume */}
      <td className="px-6 py-4 text-right tabular-nums whitespace-nowrap">
        <div className="font-semibold text-slate-900 dark:text-white">
          {user.role === 'client'
            ? safeFormatCurrency(user.totalSpent)
            : safeFormatCurrency(user.totalEarned)}
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
          {user.role === 'client' ? 'Spent' : 'Earned'}
        </div>
      </td>

      {/* Member since */}
      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {safeFormatDate(user.memberSince)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onView}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800
                       hover:bg-slate-200 dark:hover:bg-slate-700
                       text-slate-700 dark:text-slate-300 transition-colors
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-purple-500"
            aria-label={`View details for ${user.name}`}
            title="View details"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToggleStatus}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 ${
              isSuspended
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950 focus-visible:ring-emerald-500'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 focus-visible:ring-rose-500'
            }`}
            aria-label={isSuspended ? `Reactivate ${user.name}` : `Suspend ${user.name}`}
            title={isSuspended ? 'Reactivate user' : 'Suspend user'}
          >
            {isSuspended ? (
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Ban className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

/* ------------------------------------------------------------------ */
/*  User details modal                                                 */
/* ------------------------------------------------------------------ */
function UserDetailsModal({ user, onClose, onToggleStatus }) {
  const isSuspended = user.status === 'suspended';

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="User Account Details"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-xs">
        {/* Identity header */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-850/50 rounded-xl">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span className="truncate" title={user.name}>
                {user.name}
              </span>
              {user.isVerified && (
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="Verified" />
              )}
            </h4>
            <p className="text-slate-400 truncate" title={user.email}>
              {user.email}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge
                variant={user.role === 'client' ? 'primary' : 'success'}
                size="sm"
              >
                {user.role === 'client' ? 'Client' : 'Freelancer'}
              </Badge>
              <Badge
                variant={isSuspended ? 'danger' : 'success'}
                size="sm"
                dot
              >
                {isSuspended ? 'Suspended' : 'Active'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="space-y-0">
          <DetailRow icon={MapPin} label="Location" value={user.location} />
          <DetailRow
            icon={Calendar}
            label="Member Since"
            value={safeFormatDate(user.memberSince)}
          />

          {user.role === 'freelancer' && (
            <>
              {user.headline && (
                <DetailRow icon={Briefcase} label="Headline" value={user.headline} />
              )}
              <DetailRow
                icon={IndianRupee}
                label="Hourly Rate"
                value={`${safeFormatCurrency(user.hourlyRate)}/hr`}
              />
              <DetailRow
                icon={IndianRupee}
                label="Total Earned"
                value={safeFormatCurrency(user.totalEarned)}
              />
              <DetailRow
                icon={Star}
                label="Rating"
                value={
                  user.reviewsCount > 0
                    ? `${user.rating.toFixed(1)} ★ (${user.reviewsCount} review${
                        user.reviewsCount === 1 ? '' : 's'
                      })`
                    : 'No reviews yet'
                }
              />
            </>
          )}

          {user.role === 'client' && (
            <>
              {user.companyName && (
                <DetailRow
                  icon={Building2}
                  label="Company"
                  value={user.companyName}
                />
              )}
              <DetailRow
                icon={IndianRupee}
                label="Total Spent"
                value={safeFormatCurrency(user.totalSpent)}
              />
              <DetailRow
                icon={Briefcase}
                label="Projects Posted"
                value={String(user.projectsPosted)}
              />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={
              user.role === 'freelancer'
                ? `/freelancers/${user.id}`
                : `/admin/users/${user.id}`
            }
            className="mr-auto"
          >
            <Button variant="ghost" size="sm" icon={ExternalLink}>
              Open Profile
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant={isSuspended ? 'primary' : 'danger'}
            size="sm"
            icon={isSuspended ? CheckCircle2 : Ban}
            onClick={onToggleStatus}
          >
            {isSuspended ? 'Reactivate' : 'Suspend'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex justify-between items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-400 inline-flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
        {label}:
      </span>
      <span
        className="font-bold text-slate-900 dark:text-white text-right truncate max-w-[60%]"
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */
function UsersSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default ManageUsersPage;
// client/src/pages/admin/ManageUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllFreelancers, getAllClients } from '../../services/profile.service';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Loader2, Users, Eye, Shield } from 'lucide-react';

export function ManageUsersPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all users (freelancers + clients)
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [freelancersRes, clientsRes] = await Promise.all([
        getAllFreelancers({ limit: 100 }),
        getAllClients({ limit: 100 })
      ]);

      const allUsers = [];

      if (freelancersRes.success) {
        freelancersRes.profiles.forEach(profile => {
          allUsers.push({
            id: profile.userId?._id || profile.userId,
            name: profile.userId?.name || 'Freelancer',
            email: profile.userId?.email || '',
            avatar: profile.userId?.avatar || '',
            role: 'freelancer',
            status: profile.userId?.status || 'active',
            headline: profile.headline || '',
            hourlyRate: profile.hourlyRate || 0,
            totalEarned: profile.totalEarnings || 0,
            location: profile.location?.country || 'Global',
            memberSince: profile.createdAt,
            rating: profile.rating?.average || 0,
            reviewsCount: profile.rating?.count || 0,
            isVerified: profile.isVerified || false,
          });
        });
      }

      if (clientsRes.success) {
        clientsRes.profiles.forEach(profile => {
          allUsers.push({
            id: profile.userId?._id || profile.userId,
            name: profile.userId?.name || 'Client',
            email: profile.userId?.email || '',
            avatar: profile.userId?.avatar || '',
            role: 'client',
            status: profile.userId?.status || 'active',
            companyName: profile.companyName || '',
            totalSpent: profile.totalSpent || 0,
            projectsPosted: profile.projectsPosted || 0,
            location: profile.location?.country || 'Global',
            memberSince: profile.createdAt,
            isVerified: profile.isVerified || false,
          });
        });
      }

      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Load Failed', 'Could not load users.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users
  const filteredUsers = users.filter(u => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">User Directory & RBAC</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Platform Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total {users.length} accounts registered on SkillHire
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email..."
            size="md"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'client', 'freelancer'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Volume / Balance</th>
                  <th className="px-6 py-4">Member Since</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.name} size="sm" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {user.name}
                            {user.isVerified && (
                              <Shield className="w-3 h-3 text-emerald-500 inline ml-1" />
                            )}
                          </span>
                          <span className="text-slate-400 text-[11px]">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {user.role === 'client' ? (
                        <Badge variant="primary" size="sm">Client</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Freelancer</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success" size="sm" dot>Active</Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {user.role === 'client' 
                        ? formatCurrency(user.totalSpent || 0)
                        : formatCurrency(user.totalEarned || 0)
                      }
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(user.memberSince)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Users Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try a different search or filter.</p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="User Account Details"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl">
              <Avatar src={selectedUser.avatar} name={selectedUser.name} size="lg" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-slate-400">{selectedUser.email}</p>
                <span className="text-[11px] font-semibold text-primary-600 capitalize">
                  {selectedUser.role} Account
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUser.location}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Member Since:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatDate(selectedUser.memberSince)}</span>
              </div>

              {selectedUser.role === 'freelancer' && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Hourly Rate:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedUser.hourlyRate)}/hr</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Total Earned:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedUser.totalEarned)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Rating:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedUser.rating.toFixed(1)} ★ ({selectedUser.reviewsCount} reviews)
                    </span>
                  </div>
                </>
              )}

              {selectedUser.role === 'client' && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedUser.companyName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Total Spent:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedUser.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Projects Posted:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedUser.projectsPosted}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ManageUsersPage;
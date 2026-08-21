import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  Briefcase,
  Ban,
  Trash2,
  Eye,
  CheckCircle2
} from 'lucide-react';

export function ManageUsersPage() {
  const { usersList, toggleUserStatus, deleteUser } = useMarketplace();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'client', 'freelancer', 'admin'
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      return true;
    });
  }, [usersList, search, roleFilter]);

  const handleToggleStatus = (user) => {
    toggleUserStatus(user.id);
    const willBe = user.status === 'suspended' ? 'activated' : 'suspended';
    toast.info('User Status Changed', `User ${user.name} has been ${willBe}.`);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      toast.success('User Deleted', `Account ${userToDelete.name} has been permanently removed.`);
      setUserToDelete(null);
    }
  };

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
            Total {usersList.length} accounts registered on SkillHire
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or company..."
            size="md"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'client', 'freelancer', 'admin'].map(r => (
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

      {/* Users Data Table */}
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
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" isOnline={u.status === 'active'} />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {u.role === 'admin' ? (
                      <Badge variant="purple" size="sm">Admin</Badge>
                    ) : u.role === 'client' ? (
                      <Badge variant="primary" size="sm">Client</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Freelancer</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'suspended' ? (
                      <Badge variant="danger" size="sm" dot>Suspended</Badge>
                    ) : (
                      <Badge variant="success" size="sm" dot>Active</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {u.totalSpent ? formatCurrency(u.totalSpent) : u.totalEarned ? formatCurrency(u.totalEarned) : '$0'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {u.memberSince || '2026'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUserForModal(u)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'suspended'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                        }`}
                        title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserForModal && (
        <Modal
          isOpen={!!selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          title="User Account Details"
          subtitle={`ID: ${selectedUserForModal.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl">
              <Avatar src={selectedUserForModal.avatar} name={selectedUserForModal.name} size="lg" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedUserForModal.name}</h4>
                <p className="text-slate-400">{selectedUserForModal.email}</p>
                <span className="text-[11px] font-semibold text-primary-600 capitalize">{selectedUserForModal.role} Account</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedUserForModal.status || 'Active'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUserForModal.location || 'Global'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Member Since:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUserForModal.memberSince}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedUserForModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <ConfirmDialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete user "${userToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete Account"
        />
      )}
    </div>
  );
}

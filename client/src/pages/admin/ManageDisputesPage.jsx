// client/src/pages/admin/ManageDisputesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllDisputes, resolveDispute, getDisputeStats } from '../../services/dispute.service';
import { DisputeCard } from '../../components/cards/DisputeCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { Loader2, Scale, CheckCircle2 } from 'lucide-react';

export function ManageDisputesPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeDispute, setActiveDispute] = useState(null);
  const [resolution, setResolution] = useState('release_payment');
  const [adminNote, setAdminNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const itemsPerPage = 10;

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter || undefined,
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const [disputesRes, statsRes] = await Promise.all([
        getAllDisputes(params),
        getDisputeStats()
      ]);

      if (disputesRes.success) {
        setDisputes(disputesRes.disputes || []);
        setTotalPages(disputesRes.totalPages || 1);
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      toast.error('Load Failed', 'Could not load disputes.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, toast]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Handle resolve
  const handleResolve = async () => {
    if (!activeDispute) return;

    setIsResolving(true);

    try {
      const response = await resolveDispute(activeDispute._id, {
        resolution,
        adminNote: adminNote.trim(),
      });

      if (response.success) {
        toast.success('Dispute Resolved', 'Resolution applied successfully.');
        setActiveDispute(null);
        setAdminNote('');
        setResolution('release_payment');
        fetchDisputes();
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      toast.error('Resolve Failed', error.response?.data?.message || 'Could not resolve dispute.');
    } finally {
      setIsResolving(false);
    }
  };

  // Filter by search (client-side)
  const filteredDisputes = disputes.filter(d => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      d.reason?.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query) ||
      d.openedBy?.name?.toLowerCase().includes(query) ||
      d.against?.name?.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (isLoading && disputes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Escrow Arbitration</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Manage Disputes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Resolve escrow conflicts between clients and freelancers
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block">Total</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block">Open</span>
            <span className="text-2xl font-extrabold text-rose-600">{stats.open}</span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block">Under Review</span>
            <span className="text-2xl font-extrabold text-amber-600">{stats.underReview}</span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block">Resolved</span>
            <span className="text-2xl font-extrabold text-emerald-600">{stats.resolved}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search disputes..." size="md" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length > 0 ? (
        <>
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
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
                  resolution: dispute.resolution,
                  adminNote: dispute.adminNote,
                }}
                onResolve={() => setActiveDispute(dispute)}
                isAdminView={true}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <EmptyState
          icon={Scale}
          title="No disputes found"
          description="Disputes will appear here when users open them."
        />
      )}

      {/* Resolve Modal */}
      {activeDispute && (
        <Modal
          isOpen={!!activeDispute}
          onClose={() => setActiveDispute(null)}
          title="Resolve Dispute"
          subtitle={`Dispute: ${activeDispute.reason || 'Dispute'}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl text-xs space-y-2">
              <p><strong>Project:</strong> {activeDispute.projectId?.title || 'N/A'}</p>
              <p><strong>Opened By:</strong> {activeDispute.openedBy?.name || 'N/A'}</p>
              <p><strong>Against:</strong> {activeDispute.against?.name || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-400">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="release_payment">Release Payment to Freelancer</option>
                <option value="refund_client">Refund Client</option>
                <option value="partial_refund">Partial Refund</option>
                <option value="no_action">No Action Needed</option>
              </select>
            </div>

            <Textarea
              label="Admin Note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Explain your decision..."
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setActiveDispute(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={handleResolve}
                isLoading={isResolving}
              >
                Confirm Resolution
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ManageDisputesPage;
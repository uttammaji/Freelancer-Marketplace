// client/src/pages/freelancer/MyProposalsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyProposals, withdrawProposal } from '../../services/proposal.service';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  FileText, 
  Search, 
  ArrowUpRight, 
  Loader2,
  Clock,
} from 'lucide-react';

export function MyProposalsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch freelancer's proposals
  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await getMyProposals();
      
      if (response.success) {
        setProposals(response.proposals || []);
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      toast.error('Load Failed', 'Could not load your proposals.');
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Filter by tab
  const filtered = proposals.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Bids', badge: proposals.length },
    { id: 'pending', label: 'Pending Review', badge: proposals.filter(p => p.status === 'pending').length },
    { id: 'shortlisted', label: 'Shortlisted', badge: proposals.filter(p => p.status === 'shortlisted').length },
    { id: 'accepted', label: 'Hired & Active', badge: proposals.filter(p => p.status === 'accepted').length },
    { id: 'rejected', label: 'Rejected', badge: proposals.filter(p => p.status === 'rejected').length },
  ];

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success" size="sm" dot>Hired</Badge>;
      case 'shortlisted':
        return <Badge variant="primary" size="sm" dot>Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm" dot>Declined</Badge>;
      case 'withdrawn':
        return <Badge variant="default" size="sm">Withdrawn</Badge>;
      default:
        return <Badge variant="warning" size="sm" dot>Under Review</Badge>;
    }
  };

  // Handle withdraw
  const handleWithdraw = async (proposalId) => {
    try {
      const response = await withdrawProposal(proposalId);
      
      if (response.success) {
        setProposals(prev => 
          prev.map(p => 
            p._id === proposalId 
              ? { ...p, status: 'withdrawn' } 
              : p
          )
        );
        toast.success('Withdrawn', 'Your bid has been withdrawn.');
      }
    } catch (error) {
      console.error('Failed to withdraw:', error);
      toast.error('Action Failed', error.response?.data?.message || 'Could not withdraw proposal.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading your proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Bid Management</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Submitted Proposals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active project bids, shortlisted applications, and hiring confirmations
          </p>
        </div>

        <Link to="/projects">
          <Button variant="primary" size="md" icon={Search}>
            Browse More Jobs
          </Button>
        </Link>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((proposal) => {
            const project = proposal.projectId;
            
            return (
              <div
                key={proposal._id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-soft transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {getStatusBadge(proposal.status)}
                      <span className="text-xs text-slate-400">Submitted {formatDate(proposal.createdAt)}</span>
                    </div>
                    
                    <Link to={`/projects/${project?._id}`} className="block group">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project?.title || 'Project Title'}
                      </h3>
                    </Link>
                  </div>

                  <div className="text-right p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl sm:min-w-[120px]">
                    <span className="text-xs text-slate-400 block">Your Bid</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(proposal.bidAmount)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {proposal.deliveryDays} days delivery
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50/50 dark:bg-slate-850/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{proposal.coverLetter}"
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Category: {project?.categoryId?.name || 'General'}
                  </span>

                  <div className="flex items-center gap-2">
                    {(proposal.status === 'pending' || proposal.status === 'shortlisted') && (
                      <button
                        onClick={() => handleWithdraw(proposal._id)}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                      >
                        Withdraw Bid
                      </button>
                    )}
                    
                    <Link to={`/projects/${project?._id}`}>
                      <Button variant="outline" size="sm" iconRight={ArrowUpRight}>
                        View Project
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={activeTab === 'all' ? 'No proposals yet' : `No ${activeTab} proposals`}
          description="Browse the marketplace to find exciting projects and submit your first proposal."
          actionLabel="Find Projects"
          onAction={() => window.location.href = '/projects'}
        />
      )}
    </div>
  );
}

export default MyProposalsPage;
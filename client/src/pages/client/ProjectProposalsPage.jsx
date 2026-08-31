// client/src/pages/client/ProjectProposalsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProjectById } from '../../services/project.service';
import { 
  getProjectProposals, 
  shortlistProposal, 
  acceptProposal, 
  rejectProposal 
} from '../../services/proposal.service';
import { ProposalCard } from '../../components/cards/ProposalCard';
import { HireFreelancerModal } from '../../components/project/HireFreelancerModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Users, 
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export function ProjectProposalsPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposalForHire, setSelectedProposalForHire] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch project and proposals
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [projectRes, proposalsRes] = await Promise.all([
        getProjectById(id),
        getProjectProposals(id)
      ]);

      if (projectRes.success) {
        setProject(projectRes.project);
      }

      if (proposalsRes.success) {
        setProposals(proposalsRes.proposals || []);
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      toast.error('Load Failed', 'Could not load proposals.');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  // Handle shortlist
  const handleShortlist = async (proposalId) => {
    try {
      const response = await shortlistProposal(proposalId);
      
      if (response.success) {
        setProposals(prev => 
          prev.map(p => 
            p._id === proposalId 
              ? { ...p, status: 'shortlisted' } 
              : p
          )
        );
        toast.success('Shortlisted', 'Freelancer marked as shortlisted.');
      }
    } catch (error) {
      console.error('Failed to shortlist:', error);
      toast.error('Action Failed', error.response?.data?.message || 'Could not shortlist proposal.');
    }
  };

  // Handle reject
  const handleReject = async (proposalId) => {
    try {
      const response = await rejectProposal(proposalId);
      
      if (response.success) {
        setProposals(prev => 
          prev.map(p => 
            p._id === proposalId 
              ? { ...p, status: 'rejected' } 
              : p
          )
        );
        toast.success('Declined', 'Proposal has been declined.');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Action Failed', error.response?.data?.message || 'Could not reject proposal.');
    }
  };

  // Handle hire (called from modal)
  const handleHireConfirmed = async (proposalId) => {
    try {
      const response = await acceptProposal(proposalId);
      
      if (response.success) {
        toast.success('Freelancer Hired!', 'Proposal accepted. Contract will be created.');
        setSelectedProposalForHire(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to hire:', error);
      toast.error('Hire Failed', error.response?.data?.message || 'Could not hire freelancer.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading proposals...</p>
        </div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project not found</h2>
        <Link to="/dashboard/client/projects" className="text-primary-600 mt-2 inline-block">
          Back to My Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          to="/dashboard/client/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Projects</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm">{project.categoryId?.name || 'General'}</Badge>
              <span className="text-xs text-slate-400">
                Budget: {formatCurrency(project.budget?.min || 0)}
                {project.budget?.max > project.budget?.min && (
                  <> - {formatCurrency(project.budget.max)}</>
                )}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {project.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reviewing <span className="font-bold text-slate-900 dark:text-white">{proposals.length} proposals</span> from interested freelancers
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/projects/${project._id}`}>
              <Button variant="outline" size="sm">
                View Job Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-850/60 rounded-2xl overflow-x-auto">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Bids', count: proposals.length },
            { id: 'pending', label: 'Pending', count: proposals.filter(p => p.status === 'pending').length },
            { id: 'shortlisted', label: 'Shortlisted', count: proposals.filter(p => p.status === 'shortlisted').length },
            { id: 'accepted', label: 'Hired', count: proposals.filter(p => p.status === 'accepted').length },
            { id: 'rejected', label: 'Rejected', count: proposals.filter(p => p.status === 'rejected').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1 text-[10px] opacity-75 font-normal">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length > 0 ? (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal._id}
              proposal={{
                id: proposal._id,
                freelancerName: proposal.freelancerId?.name || 'Freelancer',
                freelancerAvatar: proposal.freelancerId?.avatar || '',
                freelancerEmail: proposal.freelancerId?.email || '',
                coverLetter: proposal.coverLetter,
                bidAmount: proposal.bidAmount,
                deliveryDays: proposal.deliveryDays,
                status: proposal.status,
                createdAt: proposal.createdAt,
              }}
              onShortlist={handleShortlist}
              onReject={handleReject}
              onHire={(p) => setSelectedProposalForHire(p)}
              isClientView={true}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={filterStatus === 'all' ? 'No proposals yet' : `No ${filterStatus} proposals`}
          description="Waiting for more freelancers to submit custom proposals on this project."
        />
      )}

      {/* Hire Freelancer Modal */}
      {selectedProposalForHire && (
        <HireFreelancerModal
          isOpen={!!selectedProposalForHire}
          onClose={() => setSelectedProposalForHire(null)}
          proposal={selectedProposalForHire}
          project={{
            id: project._id,
            title: project.title,
            budget: project.budget?.min || 0,
            budgetMax: project.budget?.max || 0,
          }}
          onHireConfirmed={handleHireConfirmed}
        />
      )}
    </div>
  );
}

export default ProjectProposalsPage;
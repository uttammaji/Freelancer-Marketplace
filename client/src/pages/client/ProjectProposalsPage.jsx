import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { ProposalCard } from '../../components/cards/ProposalCard';
import { HireFreelancerModal } from '../../components/project/HireFreelancerModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeft, MessageSquare, ShieldCheck, Users, Filter } from 'lucide-react';

export function ProjectProposalsPage() {
  const { id } = useParams();
  const { projects, proposals, updateProposalStatus } = useMarketplace();
  const toast = useToast();

  const [selectedProposalForHire, setSelectedProposalForHire] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'shortlisted', 'pending', 'accepted'

  const project = projects.find(p => p.id === id) || projects[0];
  const projectProposals = proposals.filter(p => p.projectId === project?.id);

  const filteredProposals = projectProposals.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleShortlist = (proposalId) => {
    updateProposalStatus(proposalId, 'shortlisted');
    toast.info('Proposal Shortlisted', 'Freelancer marked as shortlisted for this project.');
  };

  const handleReject = (proposalId) => {
    updateProposalStatus(proposalId, 'rejected');
    toast.info('Proposal Declined', 'Proposal has been archived.');
  };

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
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">{project?.category}</Badge>
              <span className="text-xs text-slate-400">Budget: {formatCurrency(project?.budget || 3500)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {project?.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reviewing <span className="font-bold text-slate-900 dark:text-white">{projectProposals.length} proposals</span> from interested freelancers
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/projects/${project?.id}`}>
              <Button variant="outline" size="sm">
                View Job Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-850/60 rounded-2xl">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Bids', count: projectProposals.length },
            { id: 'shortlisted', label: 'Shortlisted', count: projectProposals.filter(p => p.status === 'shortlisted').length },
            { id: 'pending', label: 'Pending', count: projectProposals.filter(p => p.status === 'pending').length },
            { id: 'accepted', label: 'Hired', count: projectProposals.filter(p => p.status === 'accepted').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
          {filteredProposals.map((prop) => (
            <ProposalCard
              key={prop.id}
              proposal={prop}
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
          title="No proposals in this category"
          description="Waiting for more freelancers to submit custom proposals on this project."
        />
      )}

      {/* Hire & Fund Escrow Modal */}
      {selectedProposalForHire && (
        <HireFreelancerModal
          isOpen={!!selectedProposalForHire}
          onClose={() => setSelectedProposalForHire(null)}
          proposal={selectedProposalForHire}
          project={project}
        />
      )}
    </div>
  );
}

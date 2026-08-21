import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FileText, Clock, ArrowUpRight, Search, CheckCircle2, X } from 'lucide-react';

export function MyProposalsPage() {
  const { currentUser } = useAuth();
  const { proposals, projects } = useMarketplace();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('all');

  const myProposals = proposals.filter(p => p.freelancerId === 'fl-1' || p.freelancerUserId === currentUser?.id);

  const filtered = myProposals.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Bids', badge: myProposals.length },
    { id: 'pending', label: 'Pending Review', badge: myProposals.filter(p => p.status === 'pending').length },
    { id: 'shortlisted', label: 'Shortlisted', badge: myProposals.filter(p => p.status === 'shortlisted').length },
    { id: 'accepted', label: 'Hired & Active', badge: myProposals.filter(p => p.status === 'accepted').length },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success" size="sm" dot>Hired (Contract Started)</Badge>;
      case 'shortlisted':
        return <Badge variant="primary" size="sm" dot>Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm" dot>Declined</Badge>;
      default:
        return <Badge variant="warning" size="sm" dot>Under Review</Badge>;
    }
  };

  const handleWithdraw = (id) => {
    toast.info('Proposal Withdrawn', 'Your bid has been withdrawn from this project.');
  };

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
          {filtered.map((prop) => {
            const project = projects.find(p => p.id === prop.projectId);
            return (
              <div
                key={prop.id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-soft transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {getStatusBadge(prop.status)}
                      <span className="text-xs text-slate-400">Submitted {formatDate(prop.createdAt)}</span>
                    </div>
                    <Link to={`/projects/${prop.projectId}`} className="block group">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project?.title || 'High-Impact Web Application'}
                      </h3>
                    </Link>
                  </div>

                  <div className="text-right p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl sm:min-w-[120px]">
                    <span className="text-xs text-slate-400 block">Your Bid</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(prop.bidAmount)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{prop.deliveryTime}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50/50 dark:bg-slate-850/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{prop.coverLetter}"
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Category: {project?.category || 'Engineering'}
                  </span>

                  <div className="flex items-center gap-2">
                    {prop.status !== 'accepted' && (
                      <button
                        onClick={() => handleWithdraw(prop.id)}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                      >
                        Withdraw Bid
                      </button>
                    )}
                    <Link to={`/projects/${prop.projectId}`}>
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
          title="No proposals found"
          description="Browse the marketplace to find exciting projects and submit your first proposal."
          actionLabel="Find Projects"
          onAction={() => window.location.href = '/projects'}
        />
      )}
    </div>
  );
}

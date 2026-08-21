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
import {
  FolderPlus,
  MessageSquare,
  MoreVertical,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Users
} from 'lucide-react';

export function MyProjectsPage() {
  const { currentUser } = useAuth();
  const { projects, updateProject } = useMarketplace();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('all');

  const clientProjects = projects.filter(p => p.clientId === currentUser?.id || p.clientId === 'usr-client-1');

  const filtered = clientProjects.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Projects', badge: clientProjects.length },
    { id: 'open', label: 'Open for Bids', badge: clientProjects.filter(p => p.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', badge: clientProjects.filter(p => p.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', badge: clientProjects.filter(p => p.status === 'completed').length },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case 'draft':
        return <Badge variant="default" size="sm">Draft</Badge>;
      default:
        return <Badge variant="warning" size="sm" dot>Open for Proposals</Badge>;
    }
  };

  const handleCloseProject = (id) => {
    updateProject(id, { status: 'completed' });
    toast.info('Project Status Updated', 'Project marked as closed/completed.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Project Management</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Posted Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track incoming bids, contract progress, and deliverables across all your listings
          </p>
        </div>

        <Link to="/dashboard/client/projects/new">
          <Button variant="primary" size="md" icon={FolderPlus}>
            Post a Project
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {/* Project Listings */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(proj.status)}
                  <span className="text-xs text-slate-400">Created {formatDate(proj.createdAt)}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{proj.category}</span>
                </div>

                <Link to={`/projects/${proj.id}`} className="block group">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {proj.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(proj.budget)}
                  </span>
                  <span>•</span>
                  <span>{proj.experienceLevel} Level</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {proj.proposalsCount || 0} Proposals received
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <Link to={`/dashboard/client/projects/${proj.id}/proposals`}>
                  <Button variant="primary" size="sm" icon={Users}>
                    View Proposals ({proj.proposalsCount || 0})
                  </Button>
                </Link>
                <Link to={`/projects/${proj.id}`}>
                  <Button variant="outline" size="sm">
                    Public View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects found in this tab"
          description="Create a new job posting to start receiving proposals from top freelancers."
          actionLabel="Post a Project"
          onAction={() => window.location.href = '/dashboard/client/projects/new'}
        />
      )}
    </div>
  );
}

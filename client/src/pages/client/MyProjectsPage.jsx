// client/src/pages/client/MyProjectsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyProjects, updateProjectStatus } from '../../services/project.service';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FolderPlus,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2,
} from 'lucide-react';

export function MyProjectsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch client's projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await getMyProjects();
      
      if (response.success) {
        setProjects(response.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Load Failed', 'Could not load your projects.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter by tab
  const filtered = projects.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All Projects', badge: projects.length },
    { id: 'open', label: 'Open for Bids', badge: projects.filter(p => p.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', badge: projects.filter(p => p.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', badge: projects.filter(p => p.status === 'completed').length },
  ];

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case 'submitted':
        return <Badge variant="info" size="sm" dot>Work Submitted</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="sm" dot>Disputed</Badge>;
      default:
        return <Badge variant="warning" size="sm" dot>Open for Proposals</Badge>;
    }
  };

  // Handle close/cancel project
  const handleCloseProject = async (projectId) => {
    try {
      const response = await updateProjectStatus(projectId, 'cancelled');
      
      if (response.success) {
        toast.success('Project Closed', 'Project has been cancelled.');
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to close project:', error);
      toast.error('Action Failed', error.response?.data?.message || 'Could not close project.');
    }
  };

  // Format skills
  const formatSkills = (skills) => {
    if (!skills) return [];
    return skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading your projects...</p>
        </div>
      </div>
    );
  }

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
          {filtered.map((project) => (
            <div
              key={project._id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-slate-400">Created {formatDate(project.createdAt)}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {project.categoryId?.name || 'General'}
                  </span>
                </div>

                <Link to={`/projects/${project._id}`} className="block group">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {project.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(project.budget?.min || 0)}
                    {project.budget?.max > project.budget?.min && (
                      <> - {formatCurrency(project.budget.max)}</>
                    )}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{project.experienceLevel || 'intermediate'} Level</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {project.proposalCount || 0} Proposals
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                {project.status === 'open' && (
                  <Link to={`/dashboard/client/projects/${project._id}/proposals`}>
                    <Button variant="primary" size="sm" icon={Users}>
                      View Proposals ({project.proposalCount || 0})
                    </Button>
                  </Link>
                )}
                
                <Link to={`/projects/${project._id}`}>
                  <Button variant="outline" size="sm" icon={ArrowUpRight}>
                    Public View
                  </Button>
                </Link>

                {project.status === 'open' && (
                  <button
                    onClick={() => handleCloseProject(project._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label="Close project"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={activeTab === 'all' ? 'No projects yet' : 'No projects in this tab'}
          description="Create a new job posting to start receiving proposals from top freelancers."
          actionLabel="Post a Project"
          onAction={() => window.location.href = '/dashboard/client/projects/new'}
        />
      )}
    </div>
  );
}

export default MyProjectsPage;
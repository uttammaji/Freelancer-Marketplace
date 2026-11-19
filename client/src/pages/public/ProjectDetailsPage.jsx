// client/src/pages/public/ProjectDetailsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProjectById, getSimilarProjects } from '../../services/project.service';
import { ProposalModal } from '../../components/project/ProposalModal';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { formatCurrency, formatDate, timeAgo } from '../../utils/formatters';
import {
  Share2,
  Clock,
  Award,
  CheckCircle2,
  ShieldCheck,
  FileText,
  ArrowLeft,
  Calendar,
  Send,
  Loader2,
} from 'lucide-react';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [similarProjects, setSimilarProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Fetch project details
  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await getProjectById(id);
      
      if (response.success) {
        setProject(response.project);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Load Failed', 'Could not load project details.');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  // Fetch similar projects
  const fetchSimilar = useCallback(async () => {
    try {
      const response = await getSimilarProjects(id);
      if (response.success) {
        setSimilarProjects(response.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch similar projects:', error);
      // Silent fail - similar projects are non-critical
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchSimilar();
  }, [fetchProject, fetchSimilar]);

  // Share project
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Project URL copied to your clipboard.');
    } catch (error) {
      toast.error('Copy Failed', 'Could not copy link.');
    }
  };

  // Format helper
  const formatSkills = (skills) => {
    if (!skills) return [];
    return skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project not found</h2>
        <p className="text-sm text-slate-500 mt-2">The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/projects" className="text-primary-600 mt-4 inline-block font-semibold hover:underline">
          Return to Projects Marketplace
        </Link>
      </div>
    );
  }

  const isFreelancer = currentUser?.role === 'freelancer';
  const isClient = currentUser?.role === 'client';
  const isProjectOwner = isClient && project.clientId?._id?.toString() === currentUser?.id?.toString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-soft space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {project.categoryId?.name || 'General'}
                  </Badge>
                  <Badge variant={project.status === 'open' ? 'success' : 'warning'} size="sm">
                    {project.status === 'open' ? 'Open' : project.status}
                  </Badge>
                </div>
                
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Share project"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium mt-3">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Posted {timeAgo(project.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {project.experienceLevel || 'intermediate'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Deadline: {formatDate(project.deadline)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Project Description</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Skills */}
            {formatSkills(project.skills).length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Required Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {formatSkills(project.skills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {project.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span>{att.filename || 'Attachment'}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Activity on this Job</h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Proposals:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{project.proposalCount || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm capitalize">{project.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Box + Client Info */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Project Budget
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(project.budget?.min || 0)}
                  {project.budget?.max > project.budget?.min && (
                    <> - {formatCurrency(project.budget.max)}</>
                  )}
                </span>
                <span className="text-xs font-semibold text-slate-400 capitalize">
                  ({project.budget?.type === 'fixed' ? 'Fixed Price' : 'Hourly'})
                </span>
              </div>
            </div>

            {/* Only show proposal button to freelancers */}
            {isFreelancer && project.status === 'open' && (
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                icon={Send}
                onClick={() => setIsProposalModalOpen(true)}
              >
                Submit Proposal
              </Button>
            )}

            {/* Show edit button to project owner */}
            {isProjectOwner && (
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => navigate(`/dashboard/client/projects`)}
              >
                Manage Project
              </Button>
            )}

            {/* Show login prompt if not logged in */}
            {!currentUser && (
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                onClick={() => navigate('/login')}
              >
                Login to Submit Proposal
              </Button>
            )}

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                <strong>100% Escrow Protection:</strong> Funds are pre-deposited and safely held during development.
              </span>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Client</h3>

            <div className="flex items-center gap-3.5">
              <Avatar 
                src={project.clientId?.avatar} 
                name={project.clientId?.name} 
                size="md" 
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {project.clientId?.name || 'Client'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {project.clientId?.email || ''}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Projects Posted:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {project.clientId?.projectsCount || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member Since:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(project.clientId?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Projects */}
      {similarProjects.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Similar Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {similarProjects.map((similar) => (
              <ProjectCard
                key={similar._id}
                project={{
                  id: similar._id,
                  title: similar.title,
                  description: similar.description,
                  category: similar.categoryId?.name || 'General',
                  budget: similar.budget?.min || 0,
                  budgetType: similar.budget?.type || 'fixed',
                  skills: formatSkills(similar.skills),
                  experienceLevel: similar.experienceLevel || 'intermediate',
                  proposalsCount: similar.proposalCount || 0,
                  createdAt: similar.createdAt,
                  clientName: similar.clientId?.name || 'Client',
                  clientAvatar: similar.clientId?.avatar || '',
                  status: similar.status
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        project={{
          id: project._id,
          title: project.title,
          budget: project.budget?.min || 0,
          budgetMax: project.budget?.max || 0,
          budgetType: project.budget?.type || 'fixed',
          category: project.categoryId?.name || 'General',
          skills: formatSkills(project.skills),
          experienceLevel: project.experienceLevel || 'intermediate',
          description: project.description,
          deadline: project.deadline,
        }}
      />
    </div>
  );
}

export default ProjectDetailsPage;
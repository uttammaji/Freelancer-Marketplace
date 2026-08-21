import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProposalModal } from '../../components/project/ProposalModal';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Rating } from '../../components/common/Rating';
import { formatCurrency, formatDate, timeAgo } from '../../utils/formatters';
import {
  Bookmark,
  Share2,
  Clock,
  DollarSign,
  Award,
  CheckCircle2,
  ShieldCheck,
  FileText,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Send,
  Building,
  MapPin
} from 'lucide-react';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, savedProjectIds, toggleSaveProject } = useMarketplace();
  const { currentUser, role } = useAuth();
  const toast = useToast();

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const project = projects.find(p => p.id === id) || projects[0];
  const isSaved = savedProjectIds.includes(project?.id);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link to="/projects" className="text-primary-600 mt-4 inline-block">Return to Projects Marketplace</Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Project URL copied to your clipboard.');
    }
  };

  const similarProjects = projects.filter(p => p.id !== project.id && p.category === project.category).slice(0, 2);

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

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Scope, Deliverables, Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-soft space-y-6">
            {/* Header meta */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">{project.category}</Badge>
                  {project.isFeatured && <Badge variant="warning" size="sm">Featured</Badge>}
                  {project.isUrgent && <Badge variant="danger" size="sm" dot>Urgent</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Share project"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      toggleSaveProject(project.id);
                      toast.info(isSaved ? 'Project Removed' : 'Project Saved');
                    }}
                    className={`p-2 rounded-xl border transition-colors ${
                      isSaved
                        ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/60 dark:border-primary-800 dark:text-primary-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    aria-label="Bookmark project"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium mt-3">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Posted {project.postedTime || timeAgo(project.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {project.experienceLevel || 'Expert'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Deadline: {formatDate(project.deadline || '2026-10-15')}
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

            {/* Deliverables Checklist */}
            {project.deliverables?.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Key Deliverables</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {project.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Required Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments if any */}
            {project.attachments?.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {project.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span>{att.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({att.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity on this Job */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Activity on this Job</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Proposals:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{project.proposalsCount || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Interviewing:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">2 candidates</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Invited:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">4 freelancers</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Escrow Funded:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Yes (Verified)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Client Info & Proposal CTA Box */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Project Budget
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(project.budget)}
                </span>
                <span className="text-xs font-semibold text-slate-400 capitalize">
                  ({project.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'})
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md"
              icon={Send}
              onClick={() => setIsProposalModalOpen(true)}
            >
              Submit Proposal
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              icon={Bookmark}
              onClick={() => {
                toggleSaveProject(project.id);
                toast.info(isSaved ? 'Project Removed' : 'Project Saved');
              }}
            >
              {isSaved ? 'Saved in Bookmarks' : 'Save Project'}
            </Button>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                <strong>100% Escrow Protection:</strong> Funds are pre-deposited by the client and safely held during development.
              </span>
            </div>
          </div>

          {/* About the Client Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Client</h3>

            <div className="flex items-center gap-3.5">
              <Avatar src={project.clientAvatar} alt={project.clientName} size="md" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{project.clientName}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>{project.clientCompany || 'Tech Enterprise'}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Location:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{project.clientLocation || 'USA'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Client Rating:</span>
                <Rating value={project.clientRating || 4.9} size="xs" showNumber={true} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Spent:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(project.clientSpent || 48500)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Projects */}
      {similarProjects.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Similar Projects in {project.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {similarProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        project={project}
      />
    </div>
  );
}

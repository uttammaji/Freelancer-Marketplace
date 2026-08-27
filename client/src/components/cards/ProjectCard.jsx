import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, DollarSign, Award, CheckCircle, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency, timeAgo } from '../../utils/formatters';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';

export function ProjectCard({ project, onQuickApply }) {
  const { savedProjectIds, toggleSaveProject } = useMarketplace();
  const toast = useToast();
  const isSaved = savedProjectIds.includes(project.id);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveProject(project.id);
    toast.info(isSaved ? 'Project Removed' : 'Project Saved', isSaved ? 'Removed from saved jobs' : 'Added to your bookmarked projects');
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-soft-lg hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top meta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="sm">
              {project.category}
            </Badge>
            {project.isFeatured && (
              <Badge variant="warning" size="sm">
                Featured
              </Badge>
            )}
            {project.isUrgent && (
              <Badge variant="danger" size="sm" dot>
                Urgent
              </Badge>
            )}
          </div>
          <button
            onClick={handleBookmark}
            type="button"
            aria-label="Bookmark project"
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/60 dark:border-primary-800 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {/* Budget & Type */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 my-3 font-medium">
          <span className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-sm">
            {project.budgetType === 'fixed' ? (
              formatCurrency(project.budget)
            ) : (
              `$${project.hourlyRateRange?.min || 40} - $${project.hourlyRateRange?.max || 70}/hr`
            )}
            <span className="text-xs font-normal text-slate-400">
              ({project.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'})
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            {project.experienceLevel || 'Expert'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {project.postedTime || timeAgo(project.createdAt)}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Skills pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.skills?.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg"
            >
              {skill}
            </span>
          ))}
          {project.skills?.length > 5 && (
            <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg">
              +{project.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Client Meta */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {project.clientPaymentVerified && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span className="text-slate-500 dark:text-slate-400">
            {project.clientSpent ? `${formatCurrency(project.clientSpent)} spent` : 'New client'}
          </span>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {project.proposalsCount || 0} bids
          </span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <span>View Job</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

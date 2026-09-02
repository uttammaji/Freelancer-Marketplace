// client/src/components/cards/ProjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Award, ArrowUpRight, MessageSquare, IndianRupee } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency, timeAgo } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function ProjectCard({ project, onQuickApply, onMessage }) {
  const toast = useToast();

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Project Saved', 'Added to your bookmarked projects.');
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-soft-lg hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Category + Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="primary" size="sm">
            {project.category || 'General'}
          </Badge>
          <button
            onClick={handleBookmark}
            type="button"
            aria-label="Bookmark project"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {/* Budget & Meta */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 my-3 font-medium">
          <span className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-sm">
            {formatCurrency(project.budget || 0)}
            <span className="text-xs font-normal text-slate-400">
              ({project.budgetType === 'hourly' ? 'Hourly' : 'Fixed Price'})
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            {project.experienceLevel || 'Intermediate'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {timeAgo(project.createdAt)}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(project.skills || []).slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg"
            >
              {skill}
            </span>
          ))}
          {(project.skills || []).length > 5 && (
            <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg">
              +{project.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {project.proposalsCount || 0} proposals
          </span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <span>View Project</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ProjectCard;
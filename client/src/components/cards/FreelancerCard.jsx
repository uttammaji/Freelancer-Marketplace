// client/src/components/cards/FreelancerCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { Rating } from '../common/Rating';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MapPin, Bookmark } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function FreelancerCard({ freelancer, onMessage }) {
  const toast = useToast();

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info('Saved', 'Freelancer bookmarked.');
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-soft-lg hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header & Avatar */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <Link to={`/freelancers/${freelancer.id}`}>
              <Avatar
                src={freelancer.avatar}
                alt={freelancer.name}
                size="lg"
                isOnline={freelancer.isAvailable}
                isVerified={freelancer.isVerified}
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/freelancers/${freelancer.id}`}
                  className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {freelancer.name}
                </Link>
                {freelancer.isVerified && (
                  <Badge variant="warning" size="sm">Verified</Badge>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                {freelancer.title}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{freelancer.location || 'Remote'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            type="button"
            aria-label="Bookmark freelancer"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Rating & Rate */}
        <div className="flex items-center justify-between py-2.5 px-3.5 bg-slate-50 dark:bg-slate-850/60 rounded-xl mb-4 text-xs">
          <Rating value={freelancer.rating || 0} reviewsCount={freelancer.reviewsCount || 0} size="xs" />
          <div className="font-bold text-slate-900 dark:text-white">
            <span>₹{(freelancer.hourlyRate || 0).toLocaleString('en-IN')}</span>
            <span className="text-slate-400 font-normal text-[11px]">/hr</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {freelancer.shortBio || freelancer.about || 'No bio provided.'}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(freelancer.skills || []).slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg"
            >
              {skill}
            </span>
          ))}
          {(freelancer.skills || []).length > 4 && (
            <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg">
              +{freelancer.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <Link to={`/freelancers/${freelancer.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            onMessage?.(freelancer);
          }}
        >
          Message
        </Button>
      </div>
    </div>
  );
}

export default FreelancerCard;
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Rating } from '../../components/common/Rating';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { PortfolioCard } from '../../components/cards/PortfolioCard';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { HireFreelancerModal } from '../../components/project/HireFreelancerModal';
import { formatCurrency } from '../../utils/formatters';
import {
  MapPin,
  Clock,
  DollarSign,
  Award,
  CheckCircle2,
  Bookmark,
  Share2,
  MessageSquare,
  Zap,
  Globe,
  GraduationCap,
  ShieldCheck,
  Package,
  Calendar,
  Sparkles
} from 'lucide-react';

export function FreelancerProfilePage() {
  const { id } = useParams();
  const { freelancers, savedFreelancerIds, toggleSaveFreelancer } = useMarketplace();
  const { currentUser, role } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('about');
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const freelancer = freelancers.find(f => f.id === id) || freelancers[0];
  const isSaved = savedFreelancerIds.includes(freelancer?.id);

  if (!freelancer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Freelancer not found</h2>
        <Link to="/freelancers" className="text-primary-600 mt-4 inline-block">Return to Talent Directory</Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Freelancer profile link copied to clipboard.');
    }
  };

  const tabs = [
    { id: 'about', label: 'Overview & Bio' },
    { id: 'portfolio', label: `Portfolio (${freelancer.portfolio?.length || 0})` },
    { id: 'services', label: `Packaged Services (${freelancer.services?.length || 0})` },
    { id: 'reviews', label: `Reviews & Feedback (${freelancer.reviews?.length || 0})` }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Hero Header Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-soft">
        {/* Cover banner */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 relative">
          {freelancer.coverImage && (
            <img
              src={freelancer.coverImage}
              alt="Cover banner"
              className="w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors border border-white/10"
              aria-label="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                toggleSaveFreelancer(freelancer.id);
                toast.info(isSaved ? 'Freelancer Removed' : 'Freelancer Saved');
              }}
              className="p-2 rounded-xl bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors border border-white/10"
              aria-label="Bookmark freelancer"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-primary-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <Avatar
                src={freelancer.avatar}
                alt={freelancer.name}
                size="2xl"
                isOnline={freelancer.isAvailable}
                isVerified={freelancer.isVerified}
                className="ring-4 ring-white dark:ring-slate-900 shadow-soft-lg"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {freelancer.name}
                  </h1>
                  {freelancer.isTopRated && (
                    <Badge variant="warning" size="sm">Top Rated</Badge>
                  )}
                  {freelancer.isVerified && (
                    <Badge variant="primary" size="sm">Verified Pro</Badge>
                  )}
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
                  {freelancer.title}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {freelancer.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Response time: {freelancer.responseTime || '< 2 hours'}
                  </span>
                  <span>•</span>
                  <Rating value={freelancer.rating} reviewsCount={freelancer.reviewsCount} size="xs" />
                </div>
              </div>
            </div>

            {/* Actions & Rate */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="text-center sm:text-right px-4 py-2 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-auto">
                <span className="text-xs text-slate-400 block">Hourly Rate</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">${freelancer.hourlyRate}/hr</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link to="/messages" className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="lg" icon={MessageSquare} className="w-full">
                    Message
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Zap}
                  className="flex-1 sm:flex-initial shadow-md font-bold"
                  onClick={() => setIsHireModalOpen(true)}
                >
                  Hire Me
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center sm:text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Total Earnings</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(freelancer.totalEarned || 84200)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Jobs Completed</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {freelancer.jobsCompleted || 38} Contracts
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Job Success Score</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {freelancer.jobSuccessScore || 99}% Success
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Hours Worked</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {freelancer.hoursWorked || 1420} hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview & Bio */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Bio & Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">About Me</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {freelancer.about || freelancer.shortBio}
              </p>
            </div>

            {/* Skills Pills */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Skills & Endorsements</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Certifications & Languages */}
          <div className="space-y-6">
            {/* Certifications */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Certifications</h3>
              <div className="space-y-3 text-xs">
                {freelancer.certifications?.length > 0 ? (
                  freelancer.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{cert.name}</h4>
                        <p className="text-[11px] text-slate-400">{cert.issuer} • {cert.year}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">Meta Senior Certified Developer (2022)</p>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Languages</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">English</span>
                  <span className="text-slate-400">Fluent / Native</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">German</span>
                  <span className="text-slate-400">Conversational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Featured Project Showcase</h2>
            <span className="text-xs text-slate-400">{freelancer.portfolio?.length || 0} Projects</span>
          </div>

          {freelancer.portfolio?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {freelancer.portfolio.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
              No portfolio items uploaded yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Packaged Services */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fixed-Price Packaged Services</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pre-defined project deliverables with guaranteed turnaround times.</p>
            </div>
          </div>

          {freelancer.services?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freelancer.services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="sm">{srv.tier} Tier</Badge>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(srv.price)}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{srv.description}</p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{srv.deliveryDays} Days Delivery</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Includes:</span>
                      {srv.features?.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full font-bold"
                    onClick={() => {
                      setSelectedService(srv);
                      setIsHireModalOpen(true);
                    }}
                  >
                    Order Service ({formatCurrency(srv.price)})
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
              No packaged services available right now. You can hire this freelancer for custom milestones.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Feedback & Work History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Verified completed contracts on SkillHire</p>
            </div>
            <Rating value={freelancer.rating} reviewsCount={freelancer.reviewsCount} size="sm" />
          </div>

          {freelancer.reviews?.length > 0 ? (
            <div className="space-y-4">
              {freelancer.reviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
              No client reviews yet.
            </div>
          )}
        </div>
      )}

      {/* Hire Freelancer Modal */}
      <HireFreelancerModal
        isOpen={isHireModalOpen}
        onClose={() => {
          setIsHireModalOpen(false);
          setSelectedService(null);
        }}
        freelancer={freelancer}
        proposal={selectedService ? { bidAmount: selectedService.price } : undefined}
      />
    </div>
  );
}

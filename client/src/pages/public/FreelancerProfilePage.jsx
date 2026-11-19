// client/src/pages/public/FreelancerProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProfileByUserId } from '../../services/profile.service';
import { getUserPortfolio } from '../../services/portfolio.service';
import { findOrCreateConversation } from '../../services/message.service';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Rating } from '../../components/common/Rating';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { PortfolioCard } from '../../components/cards/PortfolioCard';
import { formatCurrency } from '../../utils/formatters';
import {
  MapPin,
  Share2,
  MessageSquare,
  Zap,
  GraduationCap,
  Loader2,
  Briefcase,
  FolderGit2,
  ExternalLink,
  GitBranch,
  IndianRupee,
  Clock,
  CheckCircle2,
  Star,
} from 'lucide-react';

export function FreelancerProfilePage() {
  const { id } = useParams();
  const { currentUser, role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [freelancer, setFreelancer] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isMessaging, setIsMessaging] = useState(false);

  const isOwnProfile = 
    currentUser?.id === freelancer?.id ||
    currentUser?.email === freelancer?.email;

  const formatLocation = useCallback((location) => {
    if (!location) return 'Remote / Global';
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Remote / Global';
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProfileByUserId(id);
      
      if (response.success && response.profile) {
        const p = response.profile;
        
        setFreelancer({
          id: p.userId?._id || p.userId,
          name: p.userId?.name || 'Freelancer',
          email: p.userId?.email || '',
          avatar: p.userId?.avatar || '',
          title: p.headline || 'Professional Freelancer',
          bio: p.bio || '',
          hourlyRate: p.hourlyRate || 0,
          location: formatLocation(p.location),
          rating: p.rating?.average || 0,
          reviewsCount: p.rating?.count || 0,
          skills: p.skills?.map(s => typeof s === 'string' ? s : s.name) || [],
          isAvailable: p.availability?.status === 'available',
          availabilityStatus: p.availability?.status || 'available',
          hoursPerWeek: p.availability?.hoursPerWeek || 40,
          totalEarned: p.totalEarnings || 0,
          jobsCompleted: p.completedProjects || 0,
          experienceYears: p.experienceYears || 0,
          languages: p.languages || [],
          education: p.education || [],
          isVerified: p.isVerified || false,
        });
      } else {
        setError('Freelancer profile not found');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [id, formatLocation]);

  const fetchPortfolio = useCallback(async () => {
    setIsPortfolioLoading(true);
    
    try {
      const response = await getUserPortfolio(id);
      
      if (response.success) {
        setPortfolio(response.portfolio || []);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setPortfolio([]);
    } finally {
      setIsPortfolioLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchPortfolio();
    }
  }, [id, fetchProfile, fetchPortfolio]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Profile link copied to clipboard.');
    } catch (error) {
      toast.error('Copy Failed', 'Could not copy link.');
    }
  };

  const handleMessageClick = async () => {
    if (!currentUser) {
      toast.warning('Login Required', 'Please login to message freelancers.');
      navigate('/login');
      return;
    }

    if (isOwnProfile) {
      toast.warning('Cannot Message Yourself', 'This is your own profile.');
      return;
    }

    if (role === 'freelancer') {
      toast.warning('Not Allowed', 'Freelancers cannot message other freelancers.');
      return;
    }

    setIsMessaging(true);
    try {
      const response = await findOrCreateConversation(freelancer.id);
      
      if (response.success && response.conversation) {
        const conversationId = response.conversation._id;
        window.location.href = `/messages?conversation=${conversationId}`;
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed', error.response?.data?.message || 'Could not start conversation.');
    } finally {
      setIsMessaging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {error || 'Freelancer not found'}
        </h2>
        <Link to="/freelancers" className="text-primary-600 mt-4 inline-block font-semibold hover:underline">
          Return to Talent Directory
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: 'Overview & Bio' },
    { id: 'skills', label: `Skills (${freelancer.skills.length})` },
    { id: 'portfolio', label: `Portfolio (${portfolio.length})` },
    { id: 'education', label: `Education (${freelancer.education.length})` }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-soft">
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors border border-white/10"
              aria-label="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <Avatar
                src={freelancer.avatar}
                name={freelancer.name}
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
                  {freelancer.isVerified && (
                    <Badge variant="primary" size="sm"><CheckCircle2 className="w-3 h-3" /> Verified Pro</Badge>
                  )}
                  {isOwnProfile && (
                    <Badge variant="success" size="sm">This is You</Badge>
                  )}
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
                  {freelancer.title}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {freelancer.location}
                  </span>
                  <span>•</span>
                  <Rating value={freelancer.rating} reviewsCount={freelancer.reviewsCount} size="xs" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="text-center sm:text-right px-4 py-2 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-auto">
                <span className="text-xs text-slate-400 block">Hourly Rate</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-end gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {freelancer.hourlyRate}/hr
                </span>
              </div>

              {!isOwnProfile && (role === 'client' || !currentUser) && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    icon={MessageSquare} 
                    className="flex-1 sm:flex-initial"
                    onClick={handleMessageClick}
                    isLoading={isMessaging}
                  >
                    Message
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Zap}
                    className="flex-1 sm:flex-initial shadow-md font-bold"
                    onClick={() => toast.info('Hire', 'Please browse projects to hire this freelancer.')}
                  >
                    Hire Me
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl text-center sm:text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Total Earnings</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(freelancer.totalEarned)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl text-center sm:text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Jobs Completed</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {freelancer.jobsCompleted}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl text-center sm:text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Experience</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {freelancer.experienceYears} Years
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl text-center sm:text-left">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">Availability</span>
              <span className={`text-sm font-bold capitalize ${
                freelancer.availabilityStatus === 'available' ? 'text-emerald-600' :
                freelancer.availabilityStatus === 'busy' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {freelancer.availabilityStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">About Me</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {freelancer.bio || 'No bio provided yet.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Availability</h3>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  freelancer.availabilityStatus === 'available' ? 'bg-emerald-500' :
                  freelancer.availabilityStatus === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
                  {freelancer.availabilityStatus}
                </span>
                <span className="text-xs text-slate-400 ml-auto">{freelancer.hoursPerWeek} hrs/week</span>
              </div>
            </div>

            {freelancer.languages.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Languages</h3>
                <div className="space-y-2 text-xs">
                  {freelancer.languages.map((lang, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{lang.name}</span>
                      <span className="text-slate-400 capitalize">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Skills & Expertise</h3>
          {freelancer.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No skills added yet.</p>
          )}
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary-600" />
              Portfolio Projects
            </h3>
            {portfolio.length > 0 && (
              <Badge variant="primary" size="sm">{portfolio.length} Projects</Badge>
            )}
          </div>

          {isPortfolioLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : portfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <PortfolioCard
                  key={item._id}
                  portfolio={{
                    id: item._id,
                    title: item.title,
                    description: item.description || '',
                    thumbnail: item.thumbnail || item.images?.[0] || '',
                    technologies: item.technologies?.map(t => typeof t === 'string' ? t : t.name) || [],
                    liveUrl: item.liveUrl || '',
                    githubUrl: item.githubUrl || '',
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No portfolio projects yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Education</h3>
          {freelancer.education.length > 0 ? (
            <div className="space-y-3">
              {freelancer.education.map((edu, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50">
                  <GraduationCap className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{edu.institution}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {edu.degree} in {edu.field}
                    </p>
                    {edu.startYear && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No education details added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default FreelancerProfilePage;
// client/src/pages/public/LandingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllCategories } from '../../services/category.service';
import { getAllProjects } from '../../services/project.service';
import { getAllFreelancers } from '../../services/profile.service';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { FreelancerCard } from '../../components/cards/FreelancerCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Rating } from '../../components/common/Rating';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  ArrowRight,
  Award,
  Sparkles,
  Lock,
  Clock,
  DollarSign,
  Code2,
  Smartphone,
  Layout,
  Bot,
  Palette,
  TrendingUp,
  FileText,
  Video,
  ChevronRight,
  Layers,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [heroSearch, setHeroSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [latestProjects, setLatestProjects] = useState([]);
  const [totalFreelancers, setTotalFreelancers] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch landing page data
  const fetchLandingData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [categoriesRes, projectsRes, freelancersRes] = await Promise.all([
        getAllCategories(),
        getAllProjects({ limit: 3, sort: 'newest' }),
        getAllFreelancers({ limit: 3 }),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.categories?.slice(0, 8) || []);
      }

      if (projectsRes.success) {
        setLatestProjects(projectsRes.projects || []);
        setTotalProjects(projectsRes.total || 0);
      }

      if (freelancersRes.success) {
        setFeaturedFreelancers(freelancersRes.profiles || []);
        setTotalFreelancers(freelancersRes.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch landing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLandingData();
  }, [fetchLandingData]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/projects?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/projects');
    }
  };

  // Dynamic icon mapping based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    
    if (name.includes('web') || name.includes('code') || name.includes('development')) {
      return <Code2 className="w-6 h-6" />;
    }
    if (name.includes('mobile') || name.includes('app')) {
      return <Smartphone className="w-6 h-6" />;
    }
    if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
      return <Layout className="w-6 h-6" />;
    }
    if (name.includes('ai') || name.includes('ml') || name.includes('bot')) {
      return <Bot className="w-6 h-6" />;
    }
    if (name.includes('graphic') || name.includes('art') || name.includes('creative')) {
      return <Palette className="w-6 h-6" />;
    }
    if (name.includes('marketing') || name.includes('seo') || name.includes('growth')) {
      return <TrendingUp className="w-6 h-6" />;
    }
    if (name.includes('writing') || name.includes('content') || name.includes('copy')) {
      return <FileText className="w-6 h-6" />;
    }
    if (name.includes('video') || name.includes('media') || name.includes('edit')) {
      return <Video className="w-6 h-6" />;
    }
    
    return <Layers className="w-6 h-6" />;
  };

  // Map freelancer for card
  const mapFreelancer = (profile) => ({
    id: profile.userId?._id || profile.userId,
    name: profile.userId?.name || 'Freelancer',
    avatar: profile.userId?.avatar || '',
    title: profile.headline || 'Professional Freelancer',
    about: profile.bio || '',
    shortBio: profile.bio?.substring(0, 100) || '',
    hourlyRate: profile.hourlyRate || 0,
    location: [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || 'Remote',
    rating: profile.rating?.average || 0,
    reviewsCount: profile.rating?.count || 0,
    skills: profile.skills?.map(s => typeof s === 'string' ? s : s.name) || [],
    isAvailable: profile.availability?.status === 'available',
    totalEarned: profile.totalEarnings || 0,
    jobsCompleted: profile.completedProjects || 0,
  });

  // Map project for card
  const mapProject = (project) => ({
    id: project._id,
    title: project.title,
    description: project.description,
    category: project.categoryId?.name || 'General',
    budget: project.budget?.min || 0,
    budgetType: project.budget?.type || 'fixed',
    skills: project.skills?.map(s => typeof s === 'string' ? s : s.name) || [],
    experienceLevel: project.experienceLevel || 'intermediate',
    proposalsCount: project.proposalCount || 0,
    createdAt: project.createdAt,
    clientName: project.clientId?.name || 'Client',
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-12 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto animate-pulse" />
          <div className="h-16 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto animate-pulse" />
          <div className="h-12 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto animate-pulse" />
          <div className="h-14 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary-500/15 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-xs mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SkillHire 2.0 • Escrow-Protected Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Find the right talent for your{' '}
              <span className="text-gradient">next ambitious project.</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect with vetted top-tier developers, designers, and AI engineers. Collaborate seamlessly with escrow protection and zero hidden platform fees.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleHeroSearch} className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Search for skills, services, or projects..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto shrink-0 font-semibold">
                Search Marketplace
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 font-medium">Trending:</span>
              {['React', 'Next.js', 'Figma', 'Flutter', 'AI', 'DevOps'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/projects?search=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/freelancers">
              <Button variant="secondary" size="lg" iconRight={ArrowRight}>Find Freelancers</Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="lg">Find Work</Button>
            </Link>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Escrow Protected</h4>
                <p className="text-[11px] text-slate-400">Funds released only on approval</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Top 3% Vetted</h4>
                <p className="text-[11px] text-slate-400">Senior verified specialists</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Delays</h4>
                <p className="text-[11px] text-slate-400">Fast proposals within 24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Low 5% Platform Fee</h4>
                <p className="text-[11px] text-slate-400">Industry-leading lowest fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories - REAL DATA */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">Marketplace Taxonomy</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Browse Top Categories</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore high-demand skills across diverse industries.
              </p>
            </div>
            <Link to="/categories" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/projects?category=${category._id}`}
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-sm hover:shadow-soft-lg hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-200"
              >
                <div className="p-3 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{category.projectCount || 0} projects</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Freelancers - REAL DATA */}
      {featuredFreelancers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="warning" size="sm" className="mb-2">Top Rated Talent</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Featured Freelancers</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {totalFreelancers}+ professionals ready to work
              </p>
            </div>
            <Link to="/freelancers" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              <span>Explore All Freelancers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredFreelancers.map((profile) => (
              <FreelancerCard 
                key={profile.userId?._id || profile.userId} 
                freelancer={mapFreelancer(profile)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Latest Projects - REAL DATA */}
      {latestProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">Recent Opportunities</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Latest Projects</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {totalProjects}+ open opportunities
              </p>
            </div>
            <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              <span>Browse All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestProjects.map((project) => (
              <ProjectCard key={project._id} project={mapProject(project)} />
            ))}
          </div>
        </section>
      )}

      {/* 5. How It Works */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 sm:py-24 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="primary" size="sm">Frictionless Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">How SkillHire Works</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              From job post to final deliverable, our escrow system ensures a smooth, secure collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Post a Project', desc: 'Describe your requirements, scope of work, budget, and required tech stack in minutes.' },
              { step: '02', title: 'Receive Proposals', desc: 'Compare custom bids, portfolios, and client reviews from vetted senior specialists.' },
              { step: '03', title: 'Hire & Fund Escrow', desc: 'Lock milestone payments safely in SkillHire Escrow. No money is released until you approve.' },
              { step: '04', title: 'Get Quality Work Done', desc: 'Review deliverables, request revisions if needed, and release funds with a 5-star review.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative space-y-3">
                <span className="text-3xl font-black text-primary-600 dark:text-primary-400/80">{item.step}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Platform Stats - REAL NUMBERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-soft-lg">
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">{totalFreelancers}+</span>
            <p className="text-xs text-primary-200 font-medium">Verified Freelancers</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">{totalProjects}+</span>
            <p className="text-xs text-primary-200 font-medium">Projects Posted</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">98.8%</span>
            <p className="text-xs text-primary-200 font-medium">Client Satisfaction</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">50+</span>
            <p className="text-xs text-primary-200 font-medium">Countries Worldwide</p>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="warning" size="sm">Client Stories</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Trusted by Builders & Innovators</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "SkillHire made hiring an AI engineer painless. We found Rahul within 4 hours, and his RAG telemetry dashboard was delivered ahead of schedule.",
              name: "Sarah Connor",
              role: "VP of Product @ Nexus Innovations",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
              rating: 5
            },
            {
              quote: "As a freelance designer, the escrow protection and prompt milestone payouts give me peace of mind. SkillHire is easily the most polished platform out there.",
              name: "Elena Rostova",
              role: "Lead UI/UX Designer",
              avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
              rating: 5
            },
            {
              quote: "Our mobile Flutter app launched to 50k users without a hitch. The caliber of senior talent on SkillHire is noticeably higher than traditional job boards.",
              name: "Marcus Vance",
              role: "Founder @ Vance Digital Media",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
              rating: 5
            }
          ].map((t, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Rating value={t.rating} size="sm" showNumber={false} />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-soft-lg text-center space-y-6 overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to get your project moving?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Join thousands of founders and freelancers building the future on SkillHire.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard/client/projects/new">
              <Button variant="primary" size="lg" iconRight={ArrowRight}>Post a Project</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">Start Freelancing</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
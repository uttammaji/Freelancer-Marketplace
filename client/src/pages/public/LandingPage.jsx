import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { mockCategories } from '../../data/mockCategories';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { FreelancerCard } from '../../components/cards/FreelancerCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Rating } from '../../components/common/Rating';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  DollarSign,
  Briefcase,
  Code2,
  Smartphone,
  Layout,
  Bot,
  Palette,
  TrendingUp,
  FileText,
  Video,
  ChevronRight,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const { projects, freelancers } = useMarketplace();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/projects?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/projects');
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-6 h-6" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6" />;
      case 'Layout': return <Layout className="w-6 h-6" />;
      case 'Bot': return <Bot className="w-6 h-6" />;
      case 'Palette': return <Palette className="w-6 h-6" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'FileText': return <FileText className="w-6 h-6" />;
      default: return <Video className="w-6 h-6" />;
    }
  };

  const featuredFreelancers = freelancers.slice(0, 3);
  const latestProjects = projects.slice(0, 3);

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary-500/15 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-xs mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SkillHire 2.0 • Escrow-Protected Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Find the right talent for your{' '}
              <span className="text-gradient">next ambitious project.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with vetted top-tier developers, designers, and AI engineers. Collaborate seamlessly with escrow protection and zero hidden platform fees.
          </motion.p>

          {/* Large Search Component */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-2xl mx-auto pt-2"
          >
            <form
              onSubmit={handleHeroSearch}
              className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Search for skills, services, or projects (e.g. React, UI/UX, AI Agents)..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto shrink-0 font-semibold">
                Search Marketplace
              </Button>
            </form>

            {/* Popular quick tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 font-medium">Trending:</span>
              {['React', 'Next.js', 'Figma', 'Flutter', 'OpenAI RAG', 'DevOps'].map((tag) => (
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

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link to="/freelancers">
              <Button variant="secondary" size="lg" iconRight={ArrowRight}>
                Find Freelancers
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="lg">
                Find Work
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Trust Badges Bar */}
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

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="primary" size="sm" className="mb-2">Marketplace Taxonomy</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Browse Top Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore thousands of high-demand skills across diverse industries.
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mockCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/projects?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-sm hover:shadow-soft-lg hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-200"
            >
              <div className="p-3 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.icon)}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.freelancerCount}+ experts</span>
                <span className="text-slate-400">{cat.projectCount} jobs</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Freelancers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="warning" size="sm" className="mb-2">Top Rated Talent</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Freelancers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked professionals ready to jump onto your project today.
            </p>
          </div>
          <Link
            to="/freelancers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            <span>Explore All Freelancers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredFreelancers.map((fl) => (
            <FreelancerCard key={fl.id} freelancer={fl} />
          ))}
        </div>
      </section>

      {/* 4. Latest High-Budget Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="primary" size="sm" className="mb-2">Recent Opportunities</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Latest Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Exciting gigs with funded escrows and verified clients.
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            <span>Browse All {projects.length} Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestProjects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </section>

      {/* 5. How It Works (4-Step Timeline) */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 sm:py-24 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="primary" size="sm">Frictionless Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How SkillHire Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              From job post to final deliverable, our escrow system ensures a smooth, secure collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Post a Project',
                desc: 'Describe your requirements, scope of work, budget, and required tech stack in minutes.'
              },
              {
                step: '02',
                title: 'Receive Proposals',
                desc: 'Compare custom bids, portfolios, and client reviews from vetted senior specialists.'
              },
              {
                step: '03',
                title: 'Hire & Fund Escrow',
                desc: 'Lock milestone payments safely in SkillHire Escrow. No money is released until you approve.'
              },
              {
                step: '04',
                title: 'Get Quality Work Done',
                desc: 'Review deliverables, request revisions if needed, and release funds with a 5-star review.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative space-y-3"
              >
                <span className="text-3xl font-black text-primary-600 dark:text-primary-400/80">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Platform Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-soft-lg">
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">10K+</span>
            <p className="text-xs text-primary-200 font-medium">Verified Freelancers</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">5K+</span>
            <p className="text-xs text-primary-200 font-medium">Projects Completed</p>
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

      {/* 7. Client & Freelancer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="warning" size="sm">Client Stories</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Trusted by Builders & Innovators
          </h2>
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
            <div
              key={idx}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Rating value={t.rating} size="sm" showNumber={false} />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
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

      {/* 8. Final CTA Banner */}
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
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Post a Project
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Start Freelancing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

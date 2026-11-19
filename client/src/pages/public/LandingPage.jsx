// client/src/pages/public/LandingPage.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Bot, Briefcase, Check, ChevronRight,
  Clock, Code2, FileText, Layout, Layers, Lock, Palette, Search,
  ShieldCheck, Smartphone, Star, TrendingUp, Users, Video,
} from 'lucide-react';

import { getAllCategories } from '../../services/category.service';
import { getAllProjects } from '../../services/project.service';
import { getAllFreelancers } from '../../services/profile.service';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { FreelancerCard } from '../../components/cards/FreelancerCard';
import { Button } from '../../components/common/Button';
import { Rating } from '../../components/common/Rating';

const HERO_TAGS = ['React', 'Next.js', 'Figma', 'Flutter', 'LLM', 'DevOps'];

// Only the categories we actually have icons for get a real one.
// Everything else falls back to Layers — good enough, no need to over-engineer it.
const ICONS = {
  web: Code2, dev: Code2,
  mobile: Smartphone, app: Smartphone,
  design: Layout, ui: Layout,
  ai: Bot, ml: Bot,
  graphic: Palette, art: Palette,
  market: TrendingUp, seo: TrendingUp,
  writ: FileText, content: FileText,
  video: Video, media: Video,
};

const iconFor = (name = '') => {
  const key = Object.keys(ICONS).find((k) => name.toLowerCase().includes(k));
  const Icon = key ? ICONS[key] : Layers;
  return <Icon className="w-5 h-5" />;
};

// TODO: move these to a CMS eventually. For now hardcoded is fine — nobody
// has asked to edit them and they haven't changed in 6 weeks.
const STEPS = [
  { n: '01', title: 'Post the project', body: 'Scope, budget, stack. Five minutes, max.', c: 'bg-primary-600', I: Briefcase },
  { n: '02', title: 'Read the bids', body: 'You get proposals within a day — usually a handful of good ones, not 80 spam ones.', c: 'bg-accent-600', I: Users },
  { n: '03', title: 'Fund escrow', body: 'Milestone money is held by us. Freelancer sees it\'s there. You can\'t get rug-pulled.', c: 'bg-amber-500', I: Lock },
  { n: '04', title: 'Ship and release', body: 'Approve the work, funds go out. Dispute window is 7 days.', c: 'bg-emerald-600', I: Check },
];

const QUOTES = [
  {
    body: 'Found an AI engineer in 4 hours. Rahul had the RAG dashboard working before I\'d even finished the spec doc.',
    who: 'Sarah Connor',
    where: 'VP Product, Nexus',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    body: 'The escrow thing is what did it for me. I\'ve been burned on Upwork twice — here the money\'s just sitting there until I say go.',
    who: 'Elena Rostova',
    where: 'UI/UX Designer',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  },
  {
    body: 'Launched to 50k users. No drama. The senior talent here is a different league from the job boards.',
    who: 'Marcus Vance',
    where: 'Founder, Vance Digital',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
];

const SHORTLIST = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&auto=format&fit=crop&q=80',
];

const skillName = (s) => (typeof s === 'string' ? s : s?.name);
const uidOf = (p) => p.userId?._id || p.userId;

const asFreelancer = (p) => ({
  id: uidOf(p),
  name: p.userId?.name || 'Freelancer',
  avatar: p.userId?.avatar || '',
  title: p.headline || 'Freelancer',
  about: p.bio || '',
  shortBio: p.bio?.slice(0, 100) || '',
  hourlyRate: p.hourlyRate || 0,
  location: [p.location?.city, p.location?.country].filter(Boolean).join(', ') || 'Remote',
  rating: p.rating?.average || 0,
  reviewsCount: p.rating?.count || 0,
  skills: (p.skills || []).map(skillName).filter(Boolean),
  isAvailable: p.availability?.status === 'available',
  totalEarned: p.totalEarnings || 0,
  jobsCompleted: p.completedProjects || 0,
});

const asProject = (p) => ({
  id: p._id,
  title: p.title,
  description: p.description,
  category: p.categoryId?.name || 'General',
  budget: p.budget?.min || 0,
  budgetType: p.budget?.type || 'fixed',
  skills: (p.skills || []).map(skillName).filter(Boolean),
  experienceLevel: p.experienceLevel || 'intermediate',
  proposalsCount: p.proposalCount || 0,
  createdAt: p.createdAt,
  clientName: p.clientId?.name || 'Client',
});

export function LandingPage() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({ freelancers: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Promise.allSettled, not Promise.all — if one endpoint is down the page
    // still renders whatever *did* come back. Getting half the landing page
    // is better than a spinner of death.
    const [c, p, f] = await Promise.allSettled([
      getAllCategories(),
      getAllProjects({ limit: 3, sort: 'newest' }),
      getAllFreelancers({ limit: 3 }),
    ]);

    if (c.status === 'fulfilled' && c.value.success) {
      setCats((c.value.categories || []).slice(0, 8));
    }
    if (p.status === 'fulfilled' && p.value.success) {
      setProjects(p.value.projects || []);
      setCounts((prev) => ({ ...prev, projects: p.value.total || 0 }));
    }
    if (f.status === 'fulfilled' && f.value.success) {
      setFreelancers(f.value.profiles || []);
      setCounts((prev) => ({ ...prev, freelancers: f.value.total || 0 }));
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const search = (term) => {
    const s = term.trim();
    nav(s ? `/projects?search=${encodeURIComponent(s)}` : '/projects');
  };

  if (loading) return <Skeleton />;

  return (
    <div className="pb-24">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <motion.div {...up(0)}>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300 mb-5">
                  <span className="w-7 h-px bg-accent-500" />
                  Built for independent work
                </p>
                <h1 className="max-w-xl text-4xl sm:text-5xl lg:text-[3.7rem] font-extrabold text-slate-900 dark:text-white leading-[1.04] tracking-[-0.035em]">
                  Great work starts with the right{' '}
                  <span className="editorial-mark text-primary-600 dark:text-primary-400 font-medium">
                    person.
                  </span>
                </h1>
              </motion.div>

              <motion.p {...up(0.08)} className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Find developers, designers and specialists who actually care about the result. Clear milestones, money in escrow, no surprises.
              </motion.p>

              <motion.div {...up(0.16)} className="mt-7">
                <form
                  onSubmit={(e) => { e.preventDefault(); search(q); }}
                  className="glass-surface flex flex-col sm:flex-row gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-soft"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 pointer-events-none" aria-hidden />
                    <label htmlFor="hero-q" className="sr-only">Search projects</label>
                    <input
                      id="hero-q"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search for skills, services, or projects…"
                      className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" className="shrink-0 whitespace-nowrap">
                    Search
                  </Button>
                </form>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="text-slate-400 font-semibold">Try</span>
                  {HERO_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => search(tag)}
                      className="glass-surface px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div {...up(0.24)} className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
                {['Escrow-protected payments', 'Flat 5% fee', 'Top 3% vetted'].map((v) => (
                  <span key={v} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <Check className="w-4 h-4 text-accent-600 dark:text-accent-400 shrink-0" />
                    {v}
                  </span>
                ))}
              </motion.div>

              <motion.div {...up(0.3)} className="flex flex-wrap gap-3 mt-8">
                <Link to="/freelancers">
                  <Button variant="primary" size="lg" iconRight={ArrowRight}>Find talent</Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="lg">Browse projects</Button>
                </Link>
              </motion.div>
            </div>

            {/* Right-side mock. Shown only on lg — on tablets it gets cramped. */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* <div className="absolute -top-7 right-8 rotate-2 rounded-full border border-accent-300 bg-accent-100 px-4 py-2 text-xs font-bold text-primary-800 shadow-card">
                4 proposals today
              </div> */}

              <div className="glass-surface relative overflow-hidden rounded-[28px] border border-slate-200/80 p-7 shadow-soft-lg dark:border-slate-800">
                <div className="mb-7 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">New project</p>
                    <p className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white">Mobile app redesign</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Open
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-5">
                  <div>
                    <p className="text-xs text-slate-400">Budget</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">₹80k – ₹1.2L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Timeline</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">4–6 weeks</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['Product design', 'Figma', 'Mobile UX'].map((s) => (
                    <span key={s} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900/60 dark:bg-primary-950/30">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {SHORTLIST.map((src, i) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm dark:border-slate-900"
                          loading="lazy"
                          aria-hidden
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Strong shortlist</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Available this week</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex max-w-full items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.07] p-4 shadow-sm">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Payment protected</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Money sits in escrow until you approve the work.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { I: Lock, t: 'Escrow-protected', d: 'Funds only move when you say so', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
            { I: Star, t: 'Top 3% only', d: 'Vetted, senior, portfolio-checked', cls: 'text-primary-600 bg-primary-50 dark:bg-primary-950/40' },
            { I: Clock, t: 'Fast bids', d: 'First proposals inside 24h', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
            { I: ShieldCheck, t: 'Flat 5%', d: 'No hidden milestone cuts', cls: 'text-accent-600 bg-accent-50 dark:bg-accent-950/40' },
          ].map(({ I, t, d, cls }) => (
            <div key={t} className="glass-surface flex items-start gap-4 p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card">
              <div className={`p-2.5 rounded-lg shrink-0 ${cls.split(' ').slice(1).join(' ')}`}>
                <I className={`w-5 h-5 ${cls.split(' ')[0]}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      {cats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-eyebrow">What people are hiring for</p>
              <h2 className="section-title">Categories</h2>
            </div>
            <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              All categories <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cats.map((c) => (
              <Link
                key={c._id}
                to={`/projects?category=${c._id}`}
                className="glass-surface group p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card hover:shadow-soft hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary-500"
              >
                <div className="p-2.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-lg w-fit mb-4 group-hover:scale-105 transition-transform">
                  {iconFor(c.name)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {c.projectCount || 0} projects
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary-500 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Freelancers ──────────────────────────────────────── */}
      {freelancers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-eyebrow">Top rated</p>
              <h2 className="section-title">Freelancers</h2>
              <p className="section-subtitle">
                {counts.freelancers ? `${counts.freelancers}+ ready to start` : 'Ready to start'}
              </p>
            </div>
            <Link to="/freelancers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              See everyone <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freelancers.map((p) => (
              <FreelancerCard key={uidOf(p)} freelancer={asFreelancer(p)} />
            ))}
          </div>
        </section>
      )}

      {/* ── Projects ─────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-eyebrow">Posted recently</p>
              <h2 className="section-title">Open projects</h2>
              <p className="section-subtitle">
                {counts.projects ? `${counts.projects}+ to bid on` : 'Fresh from the board'}
              </p>
            </div>
            <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              All projects <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={asProject(p)} />
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="glass-surface border-y border-slate-200/70 dark:border-slate-800/70 py-20 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title">Four steps, no surprises</h2>
            <p className="section-subtitle">
              Escrow on every milestone. Money moves when you say it moves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {STEPS.map(({ n, title, body, c, I }, i) => (
              <div key={n} className="relative flex flex-col items-start p-8">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-[52px] left-[calc(50%+28px)] right-0 h-px bg-slate-200 dark:bg-slate-700 z-0" />
                )}
                <div className={`relative z-10 w-12 h-12 rounded-xl ${c} flex items-center justify-center text-white shadow-odoo mb-5`}>
                  <I className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black text-slate-100 dark:text-slate-800 absolute top-5 left-8 select-none pointer-events-none">
                  {n}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-10 sm:p-14 shadow-soft-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center sm:text-left">
            {[
              { v: counts.freelancers ? `${counts.freelancers}+` : '—', l: 'Verified freelancers', I: Users },
              { v: counts.projects ? `${counts.projects}+` : '—', l: 'Projects posted', I: Briefcase },
              { v: '98.8%', l: 'Client satisfaction', I: Star },
              { v: '50+', l: 'Countries', I: TrendingUp },
            ].map(({ v, l, I }) => (
              <div key={l} className="space-y-2 flex flex-col items-center sm:items-start">
                <I className="w-6 h-6 text-primary-300 mb-1" />
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{v}</span>
                <p className="text-sm text-primary-200 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quotes ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="max-w-xl mb-12">
          <p className="section-eyebrow">What people say</p>
          <h2 className="section-title">A few clients, in their own words</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((t) => (
            <div
              key={t.who}
              className="glass-surface relative p-7 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card hover:shadow-soft transition-all duration-200 flex flex-col justify-between border-l-4 border-l-primary-500"
            >
              <span className="text-5xl font-black text-primary-100 dark:text-primary-950 absolute top-4 right-5 leading-none select-none" aria-hidden>
                &ldquo;
              </span>
              <div className="space-y-4 relative">
                <Rating value={5} size="sm" showNumber={false} />
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{t.body}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                <img src={t.img} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.who}</h4>
                  <p className="text-xs text-slate-400">{t.where}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="glass-surface relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg p-10 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-transparent to-accent-50/40 dark:from-primary-950/20 dark:to-accent-950/10 pointer-events-none rounded-2xl" />

          <div className="relative max-w-2xl mx-auto space-y-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to get moving?
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Post a project for free. Read proposals tomorrow. Ship something good.
            </p>
          </div>

          <div className="relative flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard/client/projects/new">
              <Button variant="primary" size="lg" iconRight={ArrowRight}>Post a project</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">Start freelancing</Button>
            </Link>
          </div>

          <p className="relative mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
            No card required · Escrow on every job · Cancel any time
          </p>
        </div>
      </section>
    </div>
  );
}

/* Tiny helpers that stay local because they're used once. */
const up = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

function Skeleton() {
  return (
    <div className="space-y-16 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-14 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
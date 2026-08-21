import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { mockCategories } from '../../data/mockCategories';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { ProposalModal } from '../../components/project/ProposalModal';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { ProjectCardSkeleton } from '../../components/common/SkeletonLoader';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Award,
  Sparkles
} from 'lucide-react';

export function ProjectsPage() {
  const { projects } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search query
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || 'All';

  const [search, setSearch] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedBudgetType, setSelectedBudgetType] = useState('all'); // 'all', 'fixed', 'hourly'
  const [selectedExperience, setSelectedExperience] = useState('all'); // 'all', 'Entry', 'Intermediate', 'Expert'
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(10000);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'budget_high', 'budget_low', 'proposals'
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Proposal modal state
  const [activeProjectForProposal, setActiveProjectForProposal] = useState(null);

  const allAvailableSkills = ['React', 'TypeScript', 'Node.js', 'Figma', 'Python', 'Flutter', 'Tailwind CSS', 'AWS', 'OpenAI API', 'GraphQL', 'Docker'];

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedBudgetType('all');
    setSelectedExperience('all');
    setOnlyVerified(false);
    setMinBudget(0);
    setMaxBudget(10000);
    setSelectedSkills([]);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filter and sort logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchSkill = p.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchSkill) return false;
      }

      // Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Budget Type
      if (selectedBudgetType !== 'all' && p.budgetType !== selectedBudgetType) {
        return false;
      }

      // Experience Level
      if (selectedExperience !== 'all' && p.experienceLevel !== selectedExperience) {
        return false;
      }

      // Verified Payment only
      if (onlyVerified && !p.clientPaymentVerified) {
        return false;
      }

      // Budget range
      if (p.budgetType === 'fixed') {
        if (p.budget < minBudget || p.budget > maxBudget) return false;
      }

      // Skills multi-filter
      if (selectedSkills.length > 0) {
        const hasAllSkills = selectedSkills.every(s => p.skills?.includes(s));
        if (!hasAllSkills) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'budget_high') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'budget_low') return (a.budget || 0) - (b.budget || 0);
      if (sortBy === 'proposals') return (b.proposalsCount || 0) - (a.proposalsCount || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [projects, search, selectedCategory, selectedBudgetType, selectedExperience, onlyVerified, minBudget, maxBudget, selectedSkills, sortBy]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const FilterSidebarContent = (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span>Filter Projects</span>
        </h3>
        <button
          onClick={handleResetFilters}
          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="All">All Categories</option>
          {mockCategories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Budget Type */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Job Type</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'fixed', label: 'Fixed' },
            { id: 'hourly', label: 'Hourly' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedBudgetType(t.id);
                setCurrentPage(1);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBudgetType === t.id
                  ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Experience Level</label>
        <div className="space-y-1.5">
          {['all', 'Entry', 'Intermediate', 'Expert'].map(exp => (
            <label key={exp} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="exp"
                checked={selectedExperience === exp}
                onChange={() => {
                  setSelectedExperience(exp);
                  setCurrentPage(1);
                }}
                className="text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
              />
              <span className="capitalize">{exp === 'all' ? 'Any Experience Level' : exp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills Checklist */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Required Skills</label>
        <div className="flex flex-wrap gap-1.5">
          {allAvailableSkills.map(skill => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Client Toggle */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => {
              setOnlyVerified(e.target.checked);
              setCurrentPage(1);
            }}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
          />
          <span className="font-semibold">Payment Verified Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">Project Marketplace</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Find Your Next Project
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredProjects.length}</span> active opportunities matching your search
          </p>
        </div>

        <Link to="/dashboard/client/projects/new">
          <Button variant="primary" size="md">
            Post a Project
          </Button>
        </Link>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            placeholder="Search projects by keyword, tech stack, or scope..."
            size="md"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-slate-400 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="proposals">Most Proposals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Left Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft sticky top-24">
          {FilterSidebarContent}
        </div>

        {/* Project Cards Results */}
        <div className="lg:col-span-3 space-y-4">
          {paginatedProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {paginatedProjects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    onQuickApply={(p) => setActiveProjectForProposal(p)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                className="mt-6"
              />
            </>
          ) : (
            <EmptyState
              title="No matching projects found"
              description="Try adjusting your keywords, broadening your filters, or resetting all filters."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterSidebarContent}
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      {activeProjectForProposal && (
        <ProposalModal
          isOpen={!!activeProjectForProposal}
          onClose={() => setActiveProjectForProposal(null)}
          project={activeProjectForProposal}
        />
      )}
    </div>
  );
}

// client/src/pages/public/ProjectsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllProjects, getSimilarProjects } from '../../services/project.service';
import { getAllCategories } from '../../services/category.service';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { ProposalModal } from '../../components/project/ProposalModal';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { ProjectCardSkeleton } from '../../components/common/SkeletonLoader';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Loader2,
} from 'lucide-react';

export function ProjectsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL params
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';

  // State
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [search, setSearch] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedBudgetType, setSelectedBudgetType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeProjectForProposal, setActiveProjectForProposal] = useState(null);

  const itemsPerPage = 6;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response.success) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        budgetType: selectedBudgetType || undefined,
        experienceLevel: selectedExperience || undefined,
        minBudget: minBudget > 0 ? minBudget : undefined,
        maxBudget: maxBudget < 10000 ? maxBudget : undefined,
        sort: sortBy === 'newest' ? undefined : sortBy === 'budget_high' ? 'budget' : sortBy === 'budget_low' ? 'oldest' : 'proposals'
      };

      // Remove undefined params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await getAllProjects(params);
      
      if (response.success) {
        setProjects(response.projects);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Load Failed', 'Could not load projects.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedCategory, selectedBudgetType, selectedExperience, minBudget, maxBudget, sortBy, toast]);

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProjects();
    }, search ? 500 : 0);

    return () => clearTimeout(debounceTimer);
  }, [fetchProjects]);

  // Update URL when filters change
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, setSearchParams]);

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBudgetType('');
    setSelectedExperience('');
    setSelectedSkills([]);
    setMinBudget(0);
    setMaxBudget(10000);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

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
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Budget Type */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Job Type</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: '', label: 'All' },
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
          {[
            { id: '', label: 'Any Experience Level' },
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'expert', label: 'Expert' }
          ].map(exp => (
            <label key={exp.id} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="exp"
                checked={selectedExperience === exp.id}
                onChange={() => {
                  setSelectedExperience(exp.id);
                  setCurrentPage(1);
                }}
                className="text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
              />
              <span>{exp.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">
          Budget Range: ${minBudget} - ${maxBudget}
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={maxBudget}
          onChange={(e) => {
            setMaxBudget(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full accent-primary-600 cursor-pointer"
        />
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
            Showing <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> active opportunities
          </p>
        </div>

        {currentUser?.role === 'client' && (
          <Link to="/dashboard/client/projects/new">
            <Button variant="primary" size="md">Post a Project</Button>
          </Link>
        )}
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
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-slate-400">Sort by:</span>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft sticky top-24">
          {FilterSidebarContent}
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map(i => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={{
                      id: project._id,
                      title: project.title,
                      description: project.description,
                      category: project.categoryId?.name || 'General',
                      budget: project.budget?.min || 0,
                      budgetType: project.budget?.type || 'fixed',
                      skills: project.skills?.map(s => s.name || s) || [],
                      experienceLevel: project.experienceLevel || 'intermediate',
                      proposalsCount: project.proposalCount || 0,
                      createdAt: project.createdAt,
                      clientName: project.clientId?.name || 'Client',
                      clientAvatar: project.clientId?.avatar || '',
                      status: project.status
                    }}
                    onQuickApply={(p) => setActiveProjectForProposal(p)}
                  />
                ))}
              </div>

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

export default ProjectsPage;
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { mockCategories } from '../../data/mockCategories';
import { FreelancerCard } from '../../components/cards/FreelancerCard';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { SlidersHorizontal, RotateCcw, X, Star, Users } from 'lucide-react';

export function FreelancersPage() {
  const { freelancers } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();

  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || 'All';

  const [search, setSearch] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [minRate, setMinRate] = useState(0);
  const [maxRate, setMaxRate] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'rate_low', 'rate_high', 'earned'
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
    setMinRate(0);
    setMaxRate(150);
    setMinRating(0);
    setOnlyAvailable(false);
    setSelectedSkills([]);
    setSortBy('rating');
    setCurrentPage(1);
    setSearchParams({});
  };

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter(fl => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = fl.name?.toLowerCase().includes(q);
        const matchTitle = fl.title?.toLowerCase().includes(q);
        const matchBio = fl.about?.toLowerCase().includes(q) || fl.shortBio?.toLowerCase().includes(q);
        const matchSkill = fl.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchBio && !matchSkill) return false;
      }

      // Category
      if (selectedCategory !== 'All' && fl.category !== selectedCategory) {
        return false;
      }

      // Rate range
      if (fl.hourlyRate < minRate || fl.hourlyRate > maxRate) {
        return false;
      }

      // Rating
      if (minRating > 0 && fl.rating < minRating) {
        return false;
      }

      // Only Available
      if (onlyAvailable && !fl.isAvailable) {
        return false;
      }

      // Skills multi-select
      if (selectedSkills.length > 0) {
        const hasAll = selectedSkills.every(s => fl.skills?.includes(s));
        if (!hasAll) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rate_high') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'rate_low') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'earned') return (b.totalEarned || 0) - (a.totalEarned || 0);
      return (b.rating || 5) - (a.rating || 5);
    });
  }, [freelancers, search, selectedCategory, minRate, maxRate, minRating, onlyAvailable, selectedSkills, sortBy]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage) || 1;
  const paginatedFreelancers = filteredFreelancers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const FilterSidebarContent = (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span>Filter Freelancers</span>
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
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Domain</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="All">All Disciplines</option>
          {mockCategories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Hourly Rate Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-bold uppercase tracking-wider text-slate-400">Hourly Rate</label>
          <span className="font-bold text-slate-900 dark:text-white">${minRate} - ${maxRate}/hr</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={maxRate}
            onChange={(e) => {
              setMaxRate(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full accent-primary-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Minimum Rating</label>
        <div className="space-y-1.5">
          {[
            { val: 0, label: 'Any Rating' },
            { val: 4.8, label: '4.8 ★ & above (Top Rated)' },
            { val: 4.5, label: '4.5 ★ & above' },
          ].map(r => (
            <label key={r.val} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="rating"
                checked={minRating === r.val}
                onChange={() => {
                  setMinRating(r.val);
                  setCurrentPage(1);
                }}
                className="text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block font-bold uppercase tracking-wider text-slate-400 mb-2">Skills</label>
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

      {/* Availability Toggle */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => {
              setOnlyAvailable(e.target.checked);
              setCurrentPage(1);
            }}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
          />
          <span className="font-semibold">Available Now Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="warning" size="sm" className="mb-2">Verified Talent Directory</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Find Expert Freelancers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse <span className="font-bold text-slate-900 dark:text-white">{filteredFreelancers.length}</span> vetted senior professionals ready to hire
          </p>
        </div>
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
            placeholder="Search freelancers by name, title, or skills..."
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
            <span className="hidden sm:inline text-xs font-semibold text-slate-400 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="rate_high">Highest Hourly Rate</option>
              <option value="rate_low">Lowest Hourly Rate</option>
              <option value="earned">Total Earned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters + Freelancer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Left Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft sticky top-24">
          {FilterSidebarContent}
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {paginatedFreelancers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {paginatedFreelancers.map((fl) => (
                  <FreelancerCard key={fl.id} freelancer={fl} />
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
              title="No freelancers found"
              description="Try adjusting your rate limits or clearing selected skill filters."
              actionLabel="Reset Filters"
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filter Talent</h3>
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
    </div>
  );
}

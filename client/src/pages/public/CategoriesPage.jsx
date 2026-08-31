// client/src/pages/public/CategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/category.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CategoryCardSkeleton } from '../../components/common/SkeletonLoader';
import {
  Code2,
  Smartphone,
  Layout,
  Bot,
  Palette,
  TrendingUp,
  FileText,
  Video,
  ArrowRight,
  Loader2,
  Layers,
} from 'lucide-react';

// Icon mapping based on category name (since backend only has icon string)
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
  if (name.includes('ai') || name.includes('ml') || name.includes('machine') || name.includes('bot')) {
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

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        
        if (response.success) {
          setCategories(response.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        <div className="max-w-2xl space-y-3">
          <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-96 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <div className="w-40 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Categories Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Categories will appear here once they're created.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <Badge variant="primary" size="sm">Skill Categories & Disciplines</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore All Marketplace Disciplines
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Find specialized experts ready to accelerate your milestones.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="p-3.5 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-2xl">
                  {getCategoryIcon(category.name)}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                {category.name}
              </h2>
              
              {category.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {category.description}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {category.projectCount || 0} Projects
              </span>
              
              <Link to={`/projects?category=${category._id}`}>
                <Button variant="outline" size="sm" iconRight={ArrowRight}>
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage;
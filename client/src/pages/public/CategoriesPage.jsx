import React from 'react';
import { Link } from 'react-router-dom';
import { mockCategories } from '../../data/mockCategories';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
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
  Sparkles
} from 'lucide-react';

export function CategoriesPage() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <Badge variant="primary" size="sm">Skill Categories & Disciplines</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore All Marketplace Disciplines
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          From cutting-edge Generative AI engineering to pixel-perfect design systems, find specialized experts ready to accelerate your milestones.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCategories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-soft flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="p-3.5 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-2xl">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Avg Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">${cat.averageRate || 60}/hr</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                {cat.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {cat.description}
              </p>

              {/* Popular Skills */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">High-Demand Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.popularSkills?.map((skill, idx) => (
                    <Link
                      key={idx}
                      to={`/projects?search=${encodeURIComponent(skill)}`}
                      className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {cat.freelancerCount}+ Talent • {cat.projectCount} Jobs
              </span>
              <Link to={`/projects?category=${encodeURIComponent(cat.name)}`}>
                <Button variant="outline" size="sm" iconRight={ArrowRight}>
                  View Jobs
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

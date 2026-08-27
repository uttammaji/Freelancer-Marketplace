import React from 'react';
import { mockCategories } from '../../data/mockCategories';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tags, Plus, Edit2 } from 'lucide-react';

export function ManageCategoriesPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">Taxonomy Management</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Skill Categories & Taxonomies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure marketplace domains, skill tagging trees, and average rate estimates
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus}>
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCategories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat.name}</h3>
              <Badge variant="purple" size="sm">${cat.averageRate}/hr benchmark</Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description}</p>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Recognized Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {cat.popularSkills?.map((s, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

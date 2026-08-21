import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Briefcase, Eye, Ban, CheckCircle2 } from 'lucide-react';

export function ManageProjectsPage() {
  const { projects, updateProject } = useMarketplace();
  const toast = useToast();
  const [search, setSearch] = useState('');

  const filtered = projects.filter(p => {
    if (search.trim()) {
      return p.title.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleClose = (id) => {
    updateProject(id, { status: 'completed' });
    toast.info('Project Moderated', 'Project marked as closed.');
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Badge variant="purple" size="sm" className="mb-2">Platform Content Moderation</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Manage Marketplace Projects
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit and moderate live job postings across all categories
        </p>
      </div>

      <div className="max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects or clients..." size="md" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Project Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {p.title}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="primary" size="sm">{p.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {p.clientName}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(p.budget)}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {p.status === 'in_progress' ? (
                      <Badge variant="primary" size="sm">In Progress</Badge>
                    ) : p.status === 'completed' ? (
                      <Badge variant="success" size="sm">Completed</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Open</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/projects/${p.id}`} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {p.status === 'open' && (
                        <button
                          onClick={() => handleClose(p.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                          title="Close Project"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

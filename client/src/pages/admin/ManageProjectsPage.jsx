// client/src/pages/admin/ManageProjectsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllProjectsAdmin } from '../../services/project.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Eye, 
  Loader2,
  Briefcase,
  Filter,
} from 'lucide-react';

export function ManageProjectsPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 10;

  // Fetch projects (admin sees all statuses)
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await getAllProjectsAdmin(params);
      
      if (response.success) {
        setProjects(response.projects || []);
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
  }, [currentPage, search, statusFilter, toast]);

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProjects();
    }, search ? 500 : 0);

    return () => clearTimeout(debounceTimer);
  }, [fetchProjects]);

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="primary" size="sm" dot>In Progress</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case 'submitted':
        return <Badge variant="info" size="sm" dot>Submitted</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="sm" dot>Disputed</Badge>;
      default:
        return <Badge variant="warning" size="sm" dot>Open</Badge>;
    }
  };

  // Loading state
  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">Platform Content Moderation</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manage Marketplace Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> projects • Audit and moderate across all statuses
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
        <div className="w-full sm:max-w-md">
          <SearchBar 
            value={search} 
            onChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }} 
            placeholder="Search by project title or client..." 
            size="md" 
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      {projects.length > 0 ? (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Project Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Proposals</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projects.map((project) => (
                    <tr key={project._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {project.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Posted {formatDate(project.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" size="sm">
                          {project.categoryId?.name || 'General'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {project.clientId?.name || 'Client'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {project.clientId?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(project.budget?.min || 0)}
                        {project.budget?.max > project.budget?.min && (
                          <span className="text-slate-400"> - {formatCurrency(project.budget.max)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {project.proposalCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/projects/${project._id}`} 
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            aria-label="View project"
                            title="View project details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Projects Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {search || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No projects in the marketplace yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ManageProjectsPage;
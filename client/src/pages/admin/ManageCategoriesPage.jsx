// client/src/pages/admin/ManageCategoriesPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useToast } from '../../context/ToastContext';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/category.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */
const NAME_MAX = 40;
const DESC_MAX = 200;
const ICON_MAX = 40;

const EMPTY_FORM = {
  name: '',
  description: '',
  icon: '',
  isActive: true,
};

/**
 * Validate the category form. Returns a map of field → error string.
 */
function validateForm(form, { isEdit }) {
  const errors = {};

  const name = form.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length < 2) errors.name = 'Name is too short.';
  else if (name.length > NAME_MAX) errors.name = `Name cannot exceed ${NAME_MAX} characters.`;

  if (form.description && form.description.length > DESC_MAX) {
    errors.description = `Description cannot exceed ${DESC_MAX} characters.`;
  }

  if (form.icon && form.icon.length > ICON_MAX) {
    errors.icon = `Icon name cannot exceed ${ICON_MAX} characters.`;
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ManageCategoriesPage() {
  const toast = useToast();

  /* ---------- Data state ---------- */
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* ---------- Modal / editing state ---------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Delete state ---------- */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------- UI state ---------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  /* ---------- Refs ---------- */
  const nameInputRef = useRef(null);

  /* ---------------- Fetch ---------------- */
  const fetchCategories = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
        setLoadError(null);
      }

      try {
        const response = await getAllCategories();
        if (response?.success) {
          setCategories(response.categories || []);
        } else {
          throw new Error(response?.message || 'Unexpected response');
        }
      } catch (error) {
        console.error('[ManageCategories] fetch failed:', error);
        if (!silent) {
          setLoadError(error);
          toast.error('Load Failed', 'Could not load categories.');
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------------- Derived lists ---------------- */
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((c) => {
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [categories, searchQuery, statusFilter]);

  const counts = useMemo(
    () => ({
      all: categories.length,
      active: categories.filter((c) => c.isActive).length,
      inactive: categories.filter((c) => !c.isActive).length,
    }),
    [categories]
  );

  /* ---------------- Form handlers ---------------- */
  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const markTouched = useCallback((key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const handleFieldChange = useCallback(
    (key) => (e) => {
      setField(key, e.target.value);
      // Live-validate if field was touched
      if (touched[key]) {
        setFormErrors((prev) => {
          const next = { ...form, [key]: e.target.value };
          return { ...prev, [key]: validateForm(next, { isEdit: !!editingCategory })[key] };
        });
      }
    },
    [form, touched, editingCategory, setField]
  );

  const handleBlur = useCallback(
    (key) => () => {
      markTouched(key);
      const errors = validateForm(form, { isEdit: !!editingCategory });
      setFormErrors((prev) => ({ ...prev, [key]: errors[key] }));
    },
    [form, editingCategory, markTouched]
  );

  /* ---------------- Open create / edit ---------------- */
  const openCreateModal = useCallback(() => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setTouched({});
    setIsModalOpen(true);
    // Focus the name input after mount
    setTimeout(() => nameInputRef.current?.focus?.(), 50);
  }, []);

  const openEditModal = useCallback((category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
      isActive: category.isActive !== false,
    });
    setFormErrors({});
    setTouched({});
    setIsModalOpen(true);
    setTimeout(() => nameInputRef.current?.focus?.(), 50);
  }, []);

  const closeModal = useCallback(() => {
    if (isSubmitting) return; // Prevent closing mid-save
    setIsModalOpen(false);
  }, [isSubmitting]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const errors = validateForm(form, { isEdit: !!editingCategory });
      setFormErrors(errors);
      setTouched({ name: true, description: true, icon: true });

      if (Object.values(errors).some(Boolean)) {
        toast.error('Invalid Form', 'Please fix the highlighted fields.');
        return;
      }

      setIsSubmitting(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon.trim() || null,
      };

      try {
        if (editingCategory) {
          const response = await updateCategory(editingCategory._id, {
            ...payload,
            isActive: form.isActive,
          });
          if (!response?.success) throw new Error(response?.message);

          // Optimistic local update
          setCategories((prev) =>
            prev.map((c) =>
              c._id === editingCategory._id ? { ...c, ...payload, isActive: form.isActive } : c
            )
          );
          toast.success('Updated', 'Category updated successfully.');
        } else {
          const response = await createCategory(payload);
          if (!response?.success) throw new Error(response?.message);

          // Optimistic prepend (fetch will reconcile)
          if (response.category) {
            setCategories((prev) => [response.category, ...prev]);
          } else {
            fetchCategories({ silent: true });
          }
          toast.success('Created', 'Category created successfully.');
        }

        setIsModalOpen(false);
      } catch (error) {
        console.error('[ManageCategories] save failed:', error);
        toast.error(
          'Save Failed',
          error?.response?.data?.message || error?.message || 'Could not save category.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, editingCategory, toast, fetchCategories]
  );

  /* ---------------- Delete ---------------- */
  const requestDelete = useCallback((category) => {
    setDeleteTarget(category);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const targetId = deleteTarget._id;
    const snapshot = categories;

    // Optimistic removal
    setCategories((prev) => prev.filter((c) => c._id !== targetId));
    setDeleteTarget(null);

    try {
      const response = await deleteCategory(targetId);
      if (!response?.success) throw new Error(response?.message);
      toast.success('Deleted', 'Category deleted successfully.');
    } catch (error) {
      console.error('[ManageCategories] delete failed:', error);
      // Rollback
      setCategories(snapshot);
      toast.error(
        'Delete Failed',
        error?.response?.data?.message || error?.message || 'Could not delete category.'
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, categories, toast]);

  /* ---------------- Render: loading ---------------- */
  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  /* ---------------- Render: hard error ---------------- */
  if (loadError && categories.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load categories"
          description="We hit a snag reaching the category service. Try again in a moment."
          action={
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => fetchCategories()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  /* ---------------- Render: main ---------------- */
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">
            Taxonomy Management
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Skill Categories & Taxonomies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-pretty">
            Configure marketplace domains and category management.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
          Add Category
        </Button>
      </header>

      {/* Toolbar — search + status filter */}
      {categories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories…"
              aria-label="Search categories"
            />
          </div>

          <div
            className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900"
            role="tablist"
            aria-label="Filter by status"
          >
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'active', label: 'Active', count: counts.active },
              { id: 'inactive', label: 'Inactive', count: counts.inactive },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create your first category to organise projects on the marketplace."
          action={
            <Button variant="primary" size="md" icon={Plus} onClick={openCreateModal}>
              Add Category
            </Button>
          }
        />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`No categories match "${searchQuery}"${
            statusFilter !== 'all' ? ` in ${statusFilter}` : ''
          }.`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={openEditModal}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? 'Edit Category' : 'Add Category'}
          preventClose={isSubmitting}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              ref={nameInputRef}
              label="Category Name"
              placeholder="e.g. Web Development"
              value={form.name}
              onChange={handleFieldChange('name')}
              onBlur={handleBlur('name')}
              error={touched.name ? formErrors.name : null}
              maxLength={NAME_MAX}
              helperText={`${form.name.length}/${NAME_MAX}`}
              required
              aria-label="Category name"
            />

            <Textarea
              label="Description"
              placeholder="Brief description of this category…"
              value={form.description}
              onChange={handleFieldChange('description')}
              onBlur={handleBlur('description')}
              error={touched.description ? formErrors.description : null}
              rows={3}
              maxLength={DESC_MAX}
              helperText={`${form.description.length}/${DESC_MAX}`}
              aria-label="Category description"
            />

            <Input
              label="Icon (optional)"
              placeholder="e.g. Code2, Smartphone, Layout"
              value={form.icon}
              onChange={handleFieldChange('icon')}
              onBlur={handleBlur('icon')}
              error={touched.icon ? formErrors.icon : null}
              maxLength={ICON_MAX}
              helperText="Lucide icon name. Leave blank for default."
              aria-label="Category icon name"
            />

            {editingCategory && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active (visible to clients & freelancers)
                </span>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Projects assigned to this category will be unlinked. This action cannot be undone.`
            : ''
        }
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
const CategoryCard = React.memo(function CategoryCard({
  category,
  onEdit,
  onDelete,
}) {
  const isActive = category.isActive !== false;

  return (
    <article
      className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                 rounded-2xl space-y-4 shadow-soft transition-all hover:shadow-md
                 hover:border-purple-300 dark:hover:border-purple-700/60"
      aria-label={`Category: ${category.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3
            className="text-base font-bold text-slate-900 dark:text-white truncate"
            title={category.name}
          >
            {category.name}
          </h3>
          {!isActive && (
            <Badge variant="default" size="sm">
              Inactive
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="p-2 rounded-lg text-slate-400 hover:text-purple-600
                       hover:bg-purple-50 dark:hover:bg-purple-950/40
                       transition-colors focus:outline-none focus-visible:ring-2
                       focus-visible:ring-purple-500"
            aria-label={`Edit ${category.name}`}
          >
            <Edit2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500
                       hover:bg-rose-50 dark:hover:bg-rose-950/40
                       transition-colors focus:outline-none focus-visible:ring-2
                       focus-visible:ring-rose-500"
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {category.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty line-clamp-2">
          {category.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-slate-400 tabular-nums">
          {(category.projectCount || 0).toLocaleString()} project
          {category.projectCount === 1 ? '' : 's'}
        </span>
        <Badge variant={isActive ? 'success' : 'default'} size="sm">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </article>
  );
});

function CategoriesSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default ManageCategoriesPage;
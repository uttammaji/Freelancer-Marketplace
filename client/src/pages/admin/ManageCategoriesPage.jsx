// client/src/pages/admin/ManageCategoriesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/category.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  X,
} from 'lucide-react';

export function ManageCategoriesPage() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await getAllCategories();
      
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Load Failed', 'Could not load categories.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open modal for create
  const handleCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormIcon('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || '');
    setFormIcon(category.icon || '');
    setFormIsActive(category.isActive);
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formName.trim()) {
      toast.warning('Name Required', 'Please enter a category name.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        // Update
        const response = await updateCategory(editingCategory._id, {
          name: formName.trim(),
          description: formDescription.trim(),
          icon: formIcon.trim() || null,
          isActive: formIsActive
        });

        if (response.success) {
          toast.success('Updated', 'Category updated successfully.');
          fetchCategories();
        }
      } else {
        // Create
        const response = await createCategory({
          name: formName.trim(),
          description: formDescription.trim(),
          icon: formIcon.trim() || null
        });

        if (response.success) {
          toast.success('Created', 'Category created successfully.');
          fetchCategories();
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Save Failed', error.response?.data?.message || 'Could not save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await deleteCategory(deleteTarget._id);

      if (response.success) {
        setCategories(prev => prev.filter(c => c._id !== deleteTarget._id));
        setDeleteTarget(null);
        toast.success('Deleted', 'Category deleted successfully.');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Delete Failed', error.response?.data?.message || 'Could not delete category.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm" className="mb-2">Taxonomy Management</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Skill Categories & Taxonomies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure marketplace domains and category management
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleCreate}>
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {category.name}
                  </h3>
                  {!category.isActive && (
                    <Badge variant="default" size="sm">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                    aria-label="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {category.projectCount || 0} Projects
                </span>
                <Badge variant={category.isActive ? 'success' : 'default'} size="sm">
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Tags className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Categories Yet</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first category to organize projects.</p>
          <Button variant="primary" size="md" className="mt-4" icon={Plus} onClick={handleCreate}>
            Add Category
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                placeholder="e.g. Web Development"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />

              <Textarea
                label="Description"
                placeholder="Brief description of this category..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />

              <Input
                label="Icon (optional)"
                placeholder="e.g. Code2, Smartphone, Layout"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
              />

              {editingCategory && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Category?"
          description={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}

export default ManageCategoriesPage;
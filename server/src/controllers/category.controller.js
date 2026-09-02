// server/src/controllers/category.controller.js
import { Category } from '../models/category.model.js';
import { Skill } from '../models/skill.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

/**
 * Generate slug from name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Create a new category
 * @route POST /api/categories
 * @access Private (Admin)
 */
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, icon } = req.body;

  // Generate slug from name
  const slug = generateSlug(name);

  // Check if category exists
  const categoryExists = await Category.findOne({ 
    $or: [{ name: name.toLowerCase() }, { slug }] 
  });
  
  if (categoryExists) {
    throw new AppError('Category already exists', 400);
  }

  const category = await Category.create({
    name,
    slug, 
    description,
    icon
  });

  await deleteCacheByPattern('categories:*');

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category
  });
});

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
});

/**
 * Get single category
 * @route GET /api/categories/:id
 * @access Public
 */
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    category
  });
});

/**
 * Update category
 * @route PUT /api/categories/:id
 * @access Private (Admin)
 */
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const { name, description, icon, isActive } = req.body;

  const updateData = {
    description: description || category.description,
    icon: icon || category.icon,
    isActive: isActive !== undefined ? isActive : category.isActive,
  };

  // Update name and slug if name changed
  if (name && name !== category.name) {
    updateData.name = name;
    updateData.slug = generateSlug(name);
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('categories:*');

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category
  });
});

/**
 * Delete category
 * @route DELETE /api/categories/:id
 * @access Private (Admin)
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  await Category.findByIdAndDelete(req.params.id);
  await deleteCacheByPattern('categories:*');

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * Get projects by category
 * @route GET /api/categories/:id/projects
 * @access Public
 */
export const getProjectsByCategory = asyncHandler(async (req, res, next) => {
  const { Project } = await import('../models/project.model.js');
  
  const projects = await Project.find({ 
    categoryId: req.params.id,
    status: 'open'
  })
    .populate('clientId', 'name avatar')
    .limit(10)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    projects
  });
});
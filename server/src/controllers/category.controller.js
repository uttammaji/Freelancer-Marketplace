// server/src/controllers/category.controller.js
import { Category } from '../models/category.model.js';
import { Skill } from '../models/skill.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, icon } = req.body;

  // Check if category exists
  const categoryExists = await Category.findOne({ name: name.toLowerCase() });
  if (categoryExists) {
    throw new AppError('Category already exists', 400);
  }

  const category = await Category.create({
    name,
    description,
    icon
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
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

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const { name, description, icon, isActive } = req.body;

  category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: name || category.name,
      description: description || category.description,
      icon: icon || category.icon,
      isActive: isActive !== undefined ? isActive : category.isActive
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get projects by category
// @route   GET /api/categories/:id/projects
// @access  Public
export const getProjectsByCategory = asyncHandler(async (req, res, next) => {
  const { Project } = await import('../models/project.model.js');
  
  const projects = await Project.find({ 
    category: req.params.id,
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
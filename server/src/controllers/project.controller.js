// server/src/controllers/project.controller.js
import { Project } from '../models/project.model.js';
import { Proposal } from '../models/proposal.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Client only)
export const createProject = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    categoryId,
    skills,
    budget,
    deadline,
    experienceLevel
  } = req.body;

  // Validate budget
  if (!budget || !budget.type || budget.min === undefined || budget.max === undefined) {
    throw new AppError('Please provide budget with type, min, and max', 400);
  }

  // Validate budget type
  if (!['fixed', 'hourly'].includes(budget.type)) {
    throw new AppError('Invalid budget type. Must be fixed or hourly', 400);
  }

  // Validate budget min/max
  if (budget.min < 0 || budget.max < 0 || budget.min > budget.max) {
    throw new AppError('Invalid budget range', 400);
  }

  // Validate experience level
  if (!['beginner', 'intermediate', 'expert'].includes(experienceLevel)) {
    throw new AppError('Invalid experience level', 400);
  }

  // Create project
  const project = await Project.create({
    clientId: req.user.id,
    title,
    description,
    categoryId,
    skills,
    budget: {
      type: budget.type,
      min: budget.min,
      max: budget.max
    },
    deadline,
    experienceLevel
  });

  await deleteCacheByPattern('projects:*');
  
  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    project
  });
});

// @desc    Get all projects with filters
// @route   GET /api/projects
// @access  Public
export const getAllProjects = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query = { status: 'open' };

  // Search by title or description
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (req.query.categoryId) {
    query.categoryId = req.query.categoryId;
  }

  // Filter by skills
  if (req.query.skill) {
    query.skills = { $in: [req.query.skill] };
  }

  // Filter by budget type
  if (req.query.budgetType) {
    query['budget.type'] = req.query.budgetType;
  }

  // Filter by budget range
  if (req.query.minBudget && req.query.maxBudget) {
    query['budget.min'] = { $gte: parseInt(req.query.minBudget) };
    query['budget.max'] = { $lte: parseInt(req.query.maxBudget) };
  }

  // Filter by experience level
  if (req.query.experienceLevel) {
    query.experienceLevel = req.query.experienceLevel;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Sort options
  let sort = { createdAt: -1 };
  if (req.query.sort === 'oldest') sort = { createdAt: 1 };
  if (req.query.sort === 'budget') sort = { 'budget.max': -1 };
  if (req.query.sort === 'proposals') sort = { proposalCount: -1 };

  // Execute query
  const projects = await Project.find(query)
    .populate('clientId', 'name email avatar')
    .populate('categoryId', 'name')
    .populate('skills', 'name')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  // Get total count
  const total = await Project.countDocuments(query);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    projects
  });
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('clientId', 'name email avatar')
    .populate('categoryId', 'name')
    .populate('skills', 'name');

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.status(200).json({
    success: true,
    project
  });
});

// @desc    Get client's own projects
// @route   GET /api/projects/my/projects
// @access  Private (Client only)
export const getMyProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ clientId: req.user.id })
    .populate('categoryId', 'name')
    .populate('skills', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    projects
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Client only)
export const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user is the owner
  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this project', 403);
  }

  // Check if project has proposals
  if (project.proposalCount > 0) {
    throw new AppError('Cannot update project with existing proposals', 400);
  }

  const {
    title,
    description,
    categoryId,
    skills,
    budget,
    deadline,
    experienceLevel
  } = req.body;

  project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      title: title || project.title,
      description: description || project.description,
      categoryId: categoryId || project.categoryId,
      skills: skills || project.skills,
      budget: budget || project.budget,
      deadline: deadline || project.deadline,
      experienceLevel: experienceLevel || project.experienceLevel
    },
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('projects:*');

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Client only)
export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this project', 403);
  }

  if (project.status !== 'open') {
    throw new AppError('Cannot delete project that is not open', 400);
  }

  await Project.findByIdAndDelete(req.params.id);
  await Proposal.deleteMany({ projectId: req.params.id });
  await deleteCacheByPattern('projects:*');

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// @desc    Update project status
// @route   PATCH /api/projects/:id/status
// @access  Private (Client only)
export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['open', 'in_progress', 'submitted', 'completed', 'cancelled', 'disputed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this project', 403);
  }

  project.status = status;
  await project.save();
  await deleteCacheByPattern('projects:*');

  res.status(200).json({
    success: true,
    message: 'Project status updated',
    status: project.status
  });
});

// @desc    Get similar projects
// @route   GET /api/projects/:id/similar
// @access  Public
export const getSimilarProjects = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const similarProjects = await Project.find({
    _id: { $ne: project._id },
    $or: [
      { categoryId: project.categoryId },
      { skills: { $in: project.skills } }
    ],
    status: 'open'
  })
    .populate('clientId', 'name avatar')
    .limit(5)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: similarProjects.length,
    projects: similarProjects
  });
});

// @desc    Get all projects for admin (all statuses)
// @route   GET /api/projects/admin/all
// @access  Private (Admin only)
export const getAllProjectsAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Search
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by status
  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  const projects = await Project.find(query)
    .populate('clientId', 'name email avatar')
    .populate('categoryId', 'name')
    .populate('skills', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Project.countDocuments(query);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    projects
  });
});
// server/src/controllers/portfolio.controller.js
import { Portfolio } from '../models/portfolio.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Add portfolio item
// @route   POST /api/portfolio
// @access  Private (Freelancer only)
export const addPortfolioItem = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    technologies,
    projectUrl,
    githubUrl,
    images
  } = req.body;

  // Validate at least one URL is provided
  if (!projectUrl && !githubUrl) {
    throw new AppError('Please provide at least one URL (project or GitHub)', 400);
  }

  const portfolio = await Portfolio.create({
    userId: req.user.id,
    title,
    description,
    technologies,
    projectUrl,
    githubUrl,
    images
  });

  await deleteCacheByPattern('portfolios:*');
  res.status(201).json({
    success: true,
    message: 'Portfolio item added successfully',
    portfolio
  });
});

// @desc    Get current user's portfolio
// @route   GET /api/portfolio/my
// @access  Private (Freelancer only)
export const getMyPortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.find({ userId: req.user.id })
    .sort({ createdAt: -1 });


  res.status(200).json({
    success: true,
    count: portfolio.length,
    portfolio
  });
});

// @desc    Get portfolio by user ID
// @route   GET /api/portfolio/user/:userId
// @access  Public
export const getUserPortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.find({ userId: req.params.userId })
    .sort({ createdAt: -1 });

  
  res.status(200).json({
    success: true,
    count: portfolio.length,
    portfolio
  });
});

// @desc    Get single portfolio item
// @route   GET /api/portfolio/:id
// @access  Public
export const getPortfolioById = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.id)
    .populate('userId', 'name email avatar');

  if (!portfolio) {
    throw new AppError('Portfolio item not found', 404);
  }

  res.status(200).json({
    success: true,
    portfolio
  });
});

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private (Freelancer only - owner)
export const updatePortfolioItem = asyncHandler(async (req, res, next) => {
  let portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    throw new AppError('Portfolio item not found', 404);
  }

  // Check if user is the owner
  if (portfolio.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this portfolio item', 403);
  }

  const {
    title,
    description,
    technologies,
    projectUrl,
    githubUrl,
    images
  } = req.body;

  portfolio = await Portfolio.findByIdAndUpdate(
    req.params.id,
    {
      title: title || portfolio.title,
      description: description || portfolio.description,
      technologies: technologies || portfolio.technologies,
      projectUrl: projectUrl || portfolio.projectUrl,
      githubUrl: githubUrl || portfolio.githubUrl,
      images: images || portfolio.images
    },
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('portfolios:*');

  res.status(200).json({
    success: true,
    message: 'Portfolio item updated successfully',
    portfolio
  });
});

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private (Freelancer only - owner)
export const deletePortfolioItem = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    throw new AppError('Portfolio item not found', 404);
  }

  // Check if user is the owner
  if (portfolio.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this portfolio item', 403);
  }

  await Portfolio.findByIdAndDelete(req.params.id);
  await deleteCacheByPattern('portfolios:*');
  res.status(200).json({
    success: true,
    message: 'Portfolio item deleted successfully'
  });
});

// @desc    Get featured portfolio items
// @route   GET /api/portfolio/featured
// @access  Public
export const getFeaturedPortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.find({ isFeatured: true })
    .populate('userId', 'name email avatar')
    .limit(6)
    .sort({ createdAt: -1 });

  
  res.status(200).json({
    success: true,
    count: portfolio.length,
    portfolio
  });
});
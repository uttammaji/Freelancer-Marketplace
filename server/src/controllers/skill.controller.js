// server/src/controllers/skill.controller.js
import { Skill } from '../models/skill.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private (Admin only)
export const createSkill = asyncHandler(async (req, res, next) => {
  const { name, category } = req.body;

  // Check if skill exists
  const skillExists = await Skill.findOne({ 
    name: name.toLowerCase() 
  });

  if (skillExists) {
    throw new AppError('Skill already exists', 400);
  }

  const skill = await Skill.create({
    name,
    category
  });

  res.status(201).json({
    success: true,
    message: 'Skill created successfully',
    skill
  });
});

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
export const getAllSkills = asyncHandler(async (req, res, next) => {
  let query = { isActive: true };

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Search by name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }

  const skills = await Skill.find(query)
    .populate('category', 'name')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: skills.length,
    skills
  });
});

// @desc    Get single skill by ID
// @route   GET /api/skills/:id
// @access  Public
export const getSkillById = asyncHandler(async (req, res, next) => {
  const skill = await Skill.findById(req.params.id)
    .populate('category', 'name');

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  res.status(200).json({
    success: true,
    skill
  });
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin only)
export const updateSkill = asyncHandler(async (req, res, next) => {
  let skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  const { name, category, isActive } = req.body;

  skill = await Skill.findByIdAndUpdate(
    req.params.id,
    {
      name: name || skill.name,
      category: category || skill.category,
      isActive: isActive !== undefined ? isActive : skill.isActive
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Skill updated successfully',
    skill
  });
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin only)
export const deleteSkill = asyncHandler(async (req, res, next) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  await Skill.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully'
  });
});

// @desc    Get popular skills (most used)
// @route   GET /api/skills/popular
// @access  Public
export const getPopularSkills = asyncHandler(async (req, res, next) => {
  const skills = await Skill.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: skills.length,
    skills
  });
});
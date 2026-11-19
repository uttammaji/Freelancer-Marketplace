// server/src/controllers/profile.controller.js
import { Profile } from "../models/profile.model.js";
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Create or update profile (Client or Freelancer)
// @route   POST /api/profile
// @access  Private (Client & Freelancer)
export const createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  const {
    // Common fields
    bio,
    location,
    languages,
    // Freelancer fields
    headline,
    skills,
    hourlyRate,
    experienceYears,
    availability,
    education,
    // Client fields
    companyName,
    industry,
    website
  } = req.body;

  const role = req.user.role;

  // Check if profile exists
  let profile = await Profile.findOne({ userId: req.user.id });

  if (profile) {
    // Update existing profile
    const updateData = {
      bio: bio || profile.bio,
      location: location || profile.location,
      languages: languages || profile.languages,
    };

    // Add role-specific fields
    if (role === 'freelancer') {
      updateData.headline = headline || profile.headline;
      updateData.skills = skills || profile.skills;
      updateData.hourlyRate = hourlyRate !== undefined ? hourlyRate : profile.hourlyRate;
      updateData.experienceYears = experienceYears !== undefined ? experienceYears : profile.experienceYears;
      updateData.availability = availability || profile.availability;
      updateData.education = education || profile.education;
    }

    if (role === 'client') {
      updateData.companyName = companyName || profile.companyName;
      updateData.industry = industry || profile.industry;
      updateData.website = website || profile.website;
    }

    profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    // Invalidate cache
    await deleteCacheByPattern('profiles:*');
    await deleteCacheByPattern('freelancers:*');
    await deleteCacheByPattern('clients:*');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  }

  // Create new profile
  const profileData = {
    userId: req.user.id,
    role,
    bio,
    location,
    languages,
  };

  // Add role-specific fields
  if (role === 'freelancer') {
    profileData.headline = headline;
    profileData.skills = skills;
    profileData.hourlyRate = hourlyRate;
    profileData.experienceYears = experienceYears;
    profileData.availability = availability;
    profileData.education = education;
  }

  if (role === 'client') {
    profileData.companyName = companyName;
    profileData.industry = industry;
    profileData.website = website;
  }

  profile = await Profile.create(profileData);

  // Invalidate cache
  await deleteCacheByPattern('profiles:*');
  await deleteCacheByPattern('freelancers:*');
  await deleteCacheByPattern('clients:*');

  res.status(201).json({
    success: true,
    message: 'Profile created successfully',
    profile
  });
});

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.user.id })
    .populate('userId', 'name email avatar role')
    .populate('skills', 'name');

  if (!profile) {
    throw new AppError('Profile not found. Please create your profile', 404);
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// @desc    Get profile by user ID
// @route   GET /api/profile/user/:userId
// @access  Public
export const getProfileByUserId = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req.params.userId })
    .populate('userId', 'name email avatar role')
    .populate('skills', 'name');

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  res.status(200).json({
    success: true,
    profile
  });
});

// @desc    Get all freelancer profiles
// @route   GET /api/profile/freelancers
// @access  Public
export const getAllFreelancers = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query - only freelancers
  let query = { role: 'freelancer' };

  // Search by headline or bio
  if (req.query.search) {
    query.$or = [
      { headline: { $regex: req.query.search, $options: 'i' } },
      { bio: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by skills
  if (req.query.skill) {
    query.skills = { $in: [req.query.skill] };
  }

  // Filter by availability
  if (req.query.availability) {
    query['availability.status'] = req.query.availability;
  }

  // Filter by hourly rate range
  if (req.query.minRate && req.query.maxRate) {
    query.hourlyRate = {
      $gte: parseInt(req.query.minRate),
      $lte: parseInt(req.query.maxRate)
    };
  }

  // Execute query
  const profiles = await Profile.find(query)
    .populate('userId', 'name email avatar role')
    .populate('skills', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ 'rating.average': -1, 'rating.count': -1 });

  // Get total count
  const total = await Profile.countDocuments(query);

  res.status(200).json({
    success: true,
    count: profiles.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    profiles
  });
});

// @desc    Get all client profiles
// @route   GET /api/profile/clients
// @access  Public
export const getAllClients = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query - only clients
  let query = { role: 'client' };

  // Search by company name or bio
  if (req.query.search) {
    query.$or = [
      { companyName: { $regex: req.query.search, $options: 'i' } },
      { bio: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by industry
  if (req.query.industry) {
    query.industry = req.query.industry;
  }

  // Execute query
  const profiles = await Profile.find(query)
    .populate('userId', 'name email avatar role')
    .skip(skip)
    .limit(limit)
    .sort({ totalSpent: -1 });

  // Get total count
  const total = await Profile.countDocuments(query);

  res.status(200).json({
    success: true,
    count: profiles.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    profiles
  });
});

// @desc    Delete profile
// @route   DELETE /api/profile
// @access  Private
export const deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOneAndDelete({ userId: req.user.id });

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  await deleteCacheByPattern('profiles:*');
  await deleteCacheByPattern('freelancers:*');
  await deleteCacheByPattern('clients:*');

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully'
  });
});

// @desc    Update availability status (Freelancer only)
// @route   PATCH /api/profile/availability
// @access  Private (Freelancer only)
export const updateAvailability = asyncHandler(async (req, res, next) => {
  const { status, hoursPerWeek } = req.body;

  // Check if user is freelancer
  if (req.user.role !== 'freelancer') {
    throw new AppError('Only freelancers can update availability', 403);
  }

  if (status && !['available', 'busy', 'unavailable'].includes(status)) {
    throw new AppError('Invalid availability status', 400);
  }

  const updateData = {};
  if (status) updateData['availability.status'] = status;
  if (hoursPerWeek !== undefined) updateData['availability.hoursPerWeek'] = hoursPerWeek;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    updateData,
    { new: true }
  );

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  await deleteCacheByPattern('profiles:*');
  await deleteCacheByPattern('freelancers:*');

  res.status(200).json({
    success: true,
    message: 'Availability updated',
    availability: profile.availability
  });
});
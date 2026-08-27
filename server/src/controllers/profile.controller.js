// server/src/controllers/profile.controller.js
import { Profile } from '../models/profile.model.js';
import { User } from '../models/user.models.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create or update freelancer profile
// @route   POST /api/profile
// @access  Private (Freelancer only)
export const createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  const {
    title,
    bio,
    skills,
    hourlyRate,
    experience,
    location,
    availability,
    education,
    certifications
  } = req.body;

  // Check if profile exists
  let profile = await Profile.findOne({ userId: req.user.id });

  if (profile) {
    // Update existing profile
    profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        title: title || profile.title,
        bio: bio || profile.bio,
        skills: skills || profile.skills,
        hourlyRate: hourlyRate || profile.hourlyRate,
        experience: experience || profile.experience,
        location: location || profile.location,
        availability: availability || profile.availability,
        education: education || profile.education,
        certifications: certifications || profile.certifications
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  }

  // Create new profile
  profile = await Profile.create({
    userId: req.user.id,
    title,
    bio,
    skills,
    hourlyRate,
    experience,
    location,
    availability,
    education,
    certifications
  });

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
    .populate('userId', 'name email avatar role');

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
    .populate('userId', 'name email avatar role');

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

  // Build query
  let query = {};

  // Search by title or bio
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { bio: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by skills
  if (req.query.skill) {
    query.skills = { $in: [req.query.skill] };
  }

  // Filter by availability
  if (req.query.availability) {
    query.availability = req.query.availability;
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
    .skip(skip)
    .limit(limit)
    .sort({ rating: -1, totalReviews: -1 });

  // Get total count for pagination
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

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully'
  });
});

// @desc    Update availability status
// @route   PATCH /api/profile/availability
// @access  Private (Freelancer only)
export const updateAvailability = asyncHandler(async (req, res, next) => {
  const { availability } = req.body;

  if (!['available', 'busy', 'not_available'].includes(availability)) {
    throw new AppError('Invalid availability status', 400);
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { availability },
    { new: true }
  );

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Availability updated',
    availability: profile.availability
  });
});
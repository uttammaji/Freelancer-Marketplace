// server/src/controllers/review.controller.js
import { Review } from '../models/review.model.js';
import { Contract } from '../models/contract.model.js';
import { Profile } from '../models/profile.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res, next) => {
  const {
    contractId,
    revieweeId,
    rating,
    communication,
    quality,
    professionalism,
    comment
  } = req.body;

  // Validate ratings
  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Check if contract exists
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Check if user is part of this contract
  if (
    contract.clientId.toString() !== req.user.id &&
    contract.freelancerId.toString() !== req.user.id
  ) {
    throw new AppError('Not authorized to review this contract', 403);
  }

  // Check if contract is completed
  if (contract.status !== 'completed') {
    throw new AppError('Can only review completed contracts', 400);
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    contractId,
    reviewerId: req.user.id
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this contract', 400);
  }

  // Determine reviewer and reviewee
  const reviewerId = req.user.id;
  const reviewerRole = req.user.role;

  // Create review
  const review = await Review.create({
    contractId,
    projectId: contract.projectId,
    reviewerId,
    revieweeId,
    rating,
    communication: communication || rating,
    quality: quality || rating,
    professionalism: professionalism || rating,
    comment
  });

  // Update profile rating
  const profile = await Profile.findOne({ userId: revieweeId });
  if (profile) {
    const allReviews = await Review.find({ revieweeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    
    profile.rating = totalRating / allReviews.length;
    profile.totalReviews = allReviews.length;
    await profile.save();
  }

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review
  });
});

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ revieweeId: req.params.userId })
    .populate('reviewerId', 'name email avatar role')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  });
});

// @desc    Get reviews written by current user
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ reviewerId: req.user.id })
    .populate('revieweeId', 'name email avatar role')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  });
});

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('reviewerId', 'name email avatar role')
    .populate('revieweeId', 'name email avatar role')
    .populate('projectId', 'title');

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  res.status(200).json({
    success: true,
    review
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review author only)
export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check if user is the review author
  if (review.reviewerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this review', 403);
  }

  const { rating, communication, quality, professionalism, comment } = req.body;

  review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating: rating || review.rating,
      communication: communication || review.communication,
      quality: quality || review.quality,
      professionalism: professionalism || review.professionalism,
      comment: comment || review.comment
    },
    { new: true, runValidators: true }
  );

  // Update profile rating
  const profile = await Profile.findOne({ userId: review.revieweeId });
  if (profile) {
    const allReviews = await Review.find({ revieweeId: review.revieweeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    
    profile.rating = totalRating / allReviews.length;
    await profile.save();
  }

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review author or Admin)
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check if user is the review author or admin
  if (
    review.reviewerId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  await Review.findByIdAndDelete(req.params.id);

  // Update profile rating
  const profile = await Profile.findOne({ userId: review.revieweeId });
  if (profile) {
    const allReviews = await Review.find({ revieweeId: review.revieweeId });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      profile.rating = totalRating / allReviews.length;
      profile.totalReviews = allReviews.length;
    } else {
      profile.rating = 0;
      profile.totalReviews = 0;
    }
    
    await profile.save();
  }

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get review summary for a user
// @route   GET /api/reviews/summary/:userId
// @access  Public
export const getReviewSummary = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ revieweeId: req.params.userId });

  if (reviews.length === 0) {
    return res.status(200).json({
      success: true,
      summary: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  }

  // Calculate average
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Rating distribution
  const ratingDistribution = {
    1: reviews.filter(r => r.rating === 1).length,
    2: reviews.filter(r => r.rating === 2).length,
    3: reviews.filter(r => r.rating === 3).length,
    4: reviews.filter(r => r.rating === 4).length,
    5: reviews.filter(r => r.rating === 5).length
  };

  res.status(200).json({
    success: true,
    summary: {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution
    }
  });
});
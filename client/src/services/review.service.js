// client/src/services/review.service.js
import api from './api';

/**
 * Create a review (after contract completion)
 * @param {Object} data - Review data
 * @param {string} data.contractId - Contract ID
 * @param {string} data.revieweeId - User being reviewed
 * @param {number} data.rating - Overall rating (1-5)
 * @param {number} data.communication - Communication rating (1-5)
 * @param {number} data.quality - Quality rating (1-5)
 * @param {number} data.professionalism - Professionalism rating (1-5)
 * @param {string} data.comment - Review comment
 * @returns {Promise} Created review
 */
export const createReview = async (data) => {
  const response = await api.post('/reviews', data);
  return response.data;
};

/**
 * Get reviews for a specific user
 * @param {string} userId - User ID to get reviews for
 * @returns {Promise} User's reviews
 */
export const getUserReviews = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

/**
 * Get reviews written by current user
 * @returns {Promise} Current user's reviews
 */
export const getMyReviews = async () => {
  const response = await api.get('/reviews/my');
  return response.data;
};

/**
 * Get single review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise} Review details
 */
export const getReviewById = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Update review (author only)
 * @param {string} reviewId - Review ID
 * @param {Object} data - Updated review data
 * @returns {Promise} Updated review
 */
export const updateReview = async (reviewId, data) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

/**
 * Delete review (author or admin)
 * @param {string} reviewId - Review ID
 * @returns {Promise} Delete confirmation
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Get review summary for a user
 * @param {string} userId - User ID
 * @returns {Promise} Review summary with average and distribution
 */
export const getReviewSummary = async (userId) => {
  const response = await api.get(`/reviews/summary/${userId}`);
  return response.data;
};
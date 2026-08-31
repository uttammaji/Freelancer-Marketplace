// client/src/services/dispute.service.js
import api from './api';

/**
 * Create dispute (Client or Freelancer)
 * @param {Object} data - Dispute data
 * @param {string} data.contractId - Contract ID
 * @param {string} data.reason - Dispute reason
 * @param {string} data.description - Dispute description
 * @param {Array} data.evidence - Evidence files
 * @returns {Promise} Created dispute
 */
export const createDispute = async (data) => {
  const response = await api.post('/disputes', data);
  return response.data;
};

/**
 * Get all disputes (Admin only)
 * @param {Object} params - Query params (page, limit, status)
 * @returns {Promise} Disputes list
 */
export const getAllDisputes = async (params = {}) => {
  const response = await api.get('/disputes', { params });
  return response.data;
};

/**
 * Get current user's disputes
 * @returns {Promise} User's disputes
 */
export const getMyDisputes = async () => {
  const response = await api.get('/disputes/my');
  return response.data;
};

/**
 * Get dispute by ID
 * @param {string} disputeId - Dispute ID
 * @returns {Promise} Dispute details
 */
export const getDisputeById = async (disputeId) => {
  const response = await api.get(`/disputes/${disputeId}`);
  return response.data;
};

/**
 * Update dispute (openedBy only, if open)
 * @param {string} disputeId - Dispute ID
 * @param {Object} data - Updated dispute data
 * @returns {Promise} Updated dispute
 */
export const updateDispute = async (disputeId, data) => {
  const response = await api.put(`/disputes/${disputeId}`, data);
  return response.data;
};

/**
 * Close/cancel dispute (openedBy only)
 * @param {string} disputeId - Dispute ID
 * @returns {Promise} Closed dispute
 */
export const closeDispute = async (disputeId) => {
  const response = await api.patch(`/disputes/${disputeId}/cancel`);
  return response.data;
};

/**
 * Resolve dispute (Admin only)
 * @param {string} disputeId - Dispute ID
 * @param {Object} data - Resolution data
 * @param {string} data.resolution - 'refund_client' | 'release_payment' | 'partial_refund' | 'no_action'
 * @param {string} data.adminNote - Admin note
 * @returns {Promise} Resolved dispute
 */
export const resolveDispute = async (disputeId, data) => {
  const response = await api.patch(`/disputes/${disputeId}/resolve`, data);
  return response.data;
};

/**
 * Get dispute statistics (Admin only)
 * @returns {Promise} Dispute stats
 */
export const getDisputeStats = async () => {
  const response = await api.get('/disputes/stats');
  return response.data;
};
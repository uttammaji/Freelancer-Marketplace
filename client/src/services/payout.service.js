// client/src/services/payout.service.js
import api from './api';

/**
 * Add payout method (UPI or Bank)
 * @param {Object} data - Payout method data
 * @param {string} data.type - 'upi' or 'bank'
 * @param {string} data.upiId - UPI ID (for upi type)
 * @param {string} data.accountHolderName - Account holder name (for bank type)
 * @param {string} data.accountNumber - Account number (for bank type)
 * @param {string} data.ifscCode - IFSC code (for bank type)
 * @param {string} data.bankName - Bank name (for bank type)
 * @param {string} data.branchName - Branch name (for bank type, optional)
 * @returns {Promise} Created payout method
 */
export const addPayoutMethod = async (data) => {
  const response = await api.post('/payout-methods', data);
  return response.data;
};

/**
 * Get current user's payout methods
 * @returns {Promise} List of payout methods
 */
export const getMyPayoutMethods = async () => {
  const response = await api.get('/payout-methods/my');
  return response.data;
};

/**
 * Get single payout method by ID
 * @param {string} payoutMethodId - Payout method ID
 * @returns {Promise} Payout method details
 */
export const getPayoutMethodById = async (payoutMethodId) => {
  const response = await api.get(`/payout-methods/${payoutMethodId}`);
  return response.data;
};

/**
 * Update payout method
 * @param {string} payoutMethodId - Payout method ID
 * @param {Object} data - Updated data
 * @returns {Promise} Updated payout method
 */
export const updatePayoutMethod = async (payoutMethodId, data) => {
  const response = await api.put(`/payout-methods/${payoutMethodId}`, data);
  return response.data;
};

/**
 * Set payout method as primary
 * @param {string} payoutMethodId - Payout method ID
 * @returns {Promise} Updated payout method
 */
export const setPrimaryPayoutMethod = async (payoutMethodId) => {
  const response = await api.patch(`/payout-methods/${payoutMethodId}/primary`);
  return response.data;
};

/**
 * Delete payout method
 * @param {string} payoutMethodId - Payout method ID
 * @returns {Promise} Delete confirmation
 */
export const deletePayoutMethod = async (payoutMethodId) => {
  const response = await api.delete(`/payout-methods/${payoutMethodId}`);
  return response.data;
};

export const createPayout = async (data) => {
  const response = await api.post('/payouts', data);
  return response.data;
};

export const getMyPayouts = async () => {
  const response = await api.get('/payouts/my');
  return response.data;
};

export const checkPayoutStatus = async (payoutId) => {
  const response = await api.get(`/payouts/${payoutId}/status`);
  return response.data;
};
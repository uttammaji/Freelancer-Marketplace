// client/src/services/transaction.service.js
import api from './api';

/**
 * Get current user's transactions
 * @param {Object} params - Query params (page, limit, type, status, direction)
 * @returns {Promise} Transactions list with pagination
 */
export const getMyTransactions = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

/**
 * Get all transactions (Admin only)
 * @param {Object} params - Query params (page, limit, type, status, userId)
 * @returns {Promise} All transactions with pagination
 */
export const getAllTransactions = async (params = {}) => {
  const response = await api.get('/transactions/all', { params });
  return response.data;
};

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} Transaction details
 */
export const getTransactionById = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};

/**
 * Get transaction stats for current user
 * @returns {Promise} Stats (totalCredits, totalDebits, totalCount, pendingCount)
 */
export const getTransactionStats = async () => {
  const response = await api.get('/transactions/stats');
  return response.data;
};

/**
 * Get platform stats (Admin only)
 * @returns {Promise} Platform stats (totalTransactions, completedTransactions, totalVolume)
 */
export const getPlatformStats = async () => {
  const response = await api.get('/transactions/platform-stats');
  return response.data;
};
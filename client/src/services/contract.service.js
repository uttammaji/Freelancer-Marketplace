// client/src/services/contract.service.js
import api from './api';

/**
 * Create contract (Client hires freelancer)
 * @param {Object} data - Contract data
 * @param {string} data.projectId - Project ID
 * @param {string} data.proposalId - Proposal ID
 * @returns {Promise} Created contract
 */
export const createContract = async (data) => {
  const response = await api.post('/contracts', data);
  return response.data;
};

/**
 * Get contract by ID
 * @param {string} contractId - Contract ID
 * @returns {Promise} Contract details with populated data
 */
export const getContractById = async (contractId) => {
  const response = await api.get(`/contracts/${contractId}`);
  return response.data;
};

/**
 * Get client's contracts
 * @returns {Promise} Client's contracts list
 */
export const getClientContracts = async () => {
  const response = await api.get('/contracts/client');
  return response.data;
};

/**
 * Get freelancer's contracts
 * @returns {Promise} Freelancer's contracts list
 */
export const getFreelancerContracts = async () => {
  const response = await api.get('/contracts/freelancer');
  return response.data;
};

/**
 * Update contract status (Client only)
 * @param {string} contractId - Contract ID
 * @param {string} status - 'active' | 'completed' | 'cancelled' | 'disputed'
 * @returns {Promise} Updated contract
 */
export const updateContractStatus = async (contractId, status) => {
  const response = await api.patch(`/contracts/${contractId}/status`, { status });
  return response.data;
};

/**
 * Update contract progress (Freelancer only)
 * @param {string} contractId - Contract ID
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Promise} Updated progress
 */
export const updateContractProgress = async (contractId, progress) => {
  const response = await api.patch(`/contracts/${contractId}/progress`, { progress });
  return response.data;
};

/**
 * Get contract stats (Client or Freelancer)
 * @returns {Promise} Contract statistics
 */
export const getContractStats = async () => {
  const response = await api.get('/contracts/stats');
  return response.data;
};
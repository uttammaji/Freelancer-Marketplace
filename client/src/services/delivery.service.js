// client/src/services/delivery.service.js
import api from './api';

/**
 * Submit work delivery (Freelancer)
 * @param {Object} data - Delivery data
 * @param {string} data.contractId - Contract ID
 * @param {string} data.title - Delivery title
 * @param {string} data.description - Delivery description
 * @param {Array} data.attachments - File attachments
 * @param {string} data.githubUrl - GitHub repository URL
 * @param {string} data.liveDemoUrl - Live demo URL
 * @returns {Promise} Created delivery
 */
export const createDelivery = async (data) => {
  const response = await api.post('/deliveries', data);
  return response.data;
};

/**
 * Get deliveries for a contract
 * @param {string} contractId - Contract ID
 * @returns {Promise} Contract deliveries list
 */
export const getContractDeliveries = async (contractId) => {
  const response = await api.get(`/deliveries/contract/${contractId}`);
  return response.data;
};

/**
 * Get freelancer's own deliveries
 * @returns {Promise} Freelancer's deliveries list
 */
export const getMyDeliveries = async () => {
  const response = await api.get('/deliveries/my');
  return response.data;
};

/**
 * Get single delivery by ID
 * @param {string} deliveryId - Delivery ID
 * @returns {Promise} Delivery details
 */
export const getDeliveryById = async (deliveryId) => {
  const response = await api.get(`/deliveries/${deliveryId}`);
  return response.data;
};

/**
 * Accept delivery (Client)
 * @param {string} deliveryId - Delivery ID
 * @param {Object} data - Acceptance data
 * @param {string} data.feedback - Client feedback
 * @returns {Promise} Accepted delivery
 */
export const acceptDelivery = async (deliveryId, data = {}) => {
  const response = await api.patch(`/deliveries/${deliveryId}/accept`, data);
  return response.data;
};

/**
 * Request revision (Client)
 * @param {string} deliveryId - Delivery ID
 * @param {Object} data - Revision data
 * @param {string} data.feedback - Revision feedback
 * @returns {Promise} Revision requested
 */
export const requestRevision = async (deliveryId, data) => {
  const response = await api.patch(`/deliveries/${deliveryId}/request-revision`, data);
  return response.data;
};

/**
 * Update delivery after revision (Freelancer)
 * @param {string} deliveryId - Delivery ID
 * @param {Object} data - Updated delivery data
 * @returns {Promise} Updated delivery
 */
export const updateDelivery = async (deliveryId, data) => {
  const response = await api.put(`/deliveries/${deliveryId}`, data);
  return response.data;
};

/**
 * Delete delivery (Freelancer, if not accepted)
 * @param {string} deliveryId - Delivery ID
 * @returns {Promise} Delete confirmation
 */
export const deleteDelivery = async (deliveryId) => {
  const response = await api.delete(`/deliveries/${deliveryId}`);
  return response.data;
};
// client/src/services/proposal.service.js
import api from './api';

/**
 * Submit proposal for project (Freelancer only)
 * @param {Object} data - Proposal data
 * @param {string} data.projectId - Project ID
 * @param {string} data.coverLetter - Cover letter
 * @param {number} data.bidAmount - Bid amount
 * @param {number} data.deliveryDays - Delivery days
 * @param {Array} data.attachments - File attachments
 * @returns {Promise} Created proposal
 */
export const submitProposal = async (data) => {
  const response = await api.post('/proposals', data);
  return response.data;
};

/**
 * Get freelancer's own proposals
 * @returns {Promise} Freelancer's proposals list
 */
export const getMyProposals = async () => {
  const response = await api.get('/proposals/my');
  return response.data;
};

/**
 * Get all proposals for a project (Client only)
 * @param {string} projectId - Project ID
 * @returns {Promise} Project proposals list
 */
export const getProjectProposals = async (projectId) => {
  const response = await api.get(`/proposals/project/${projectId}`);
  return response.data;
};

/**
 * Get single proposal by ID
 * @param {string} proposalId - Proposal ID
 * @returns {Promise} Proposal details
 */
export const getProposalById = async (proposalId) => {
  const response = await api.get(`/proposals/${proposalId}`);
  return response.data;
};

/**
 * Update proposal (Freelancer only, if pending)
 * @param {string} proposalId - Proposal ID
 * @param {Object} data - Updated proposal data
 * @returns {Promise} Updated proposal
 */
export const updateProposal = async (proposalId, data) => {
  const response = await api.put(`/proposals/${proposalId}`, data);
  return response.data;
};

/**
 * Withdraw proposal (Freelancer only)
 * @param {string} proposalId - Proposal ID
 * @returns {Promise} Withdrawal confirmation
 */
export const withdrawProposal = async (proposalId) => {
  const response = await api.delete(`/proposals/${proposalId}`);
  return response.data;
};

/**
 * Shortlist proposal (Client only)
 * @param {string} proposalId - Proposal ID
 * @returns {Promise} Updated status
 */
export const shortlistProposal = async (proposalId) => {
  const response = await api.patch(`/proposals/${proposalId}/shortlist`);
  return response.data;
};

/**
 * Accept proposal / Hire freelancer (Client only)
 * @param {string} proposalId - Proposal ID
 * @returns {Promise} Updated proposal and project
 */
export const acceptProposal = async (proposalId) => {
  const response = await api.patch(`/proposals/${proposalId}/accept`);
  return response.data;
};

/**
 * Reject proposal (Client only)
 * @param {string} proposalId - Proposal ID
 * @returns {Promise} Updated status
 */
export const rejectProposal = async (proposalId) => {
  const response = await api.patch(`/proposals/${proposalId}/reject`);
  return response.data;
};
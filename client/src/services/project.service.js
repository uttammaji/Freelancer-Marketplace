// client/src/services/project.service.js
import api from './api';

/**
 * Get all projects with filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search by title/description
 * @param {string} params.categoryId - Filter by category
 * @param {string} params.skill - Filter by skill
 * @param {string} params.budgetType - 'fixed' or 'hourly'
 * @param {number} params.minBudget - Minimum budget
 * @param {number} params.maxBudget - Maximum budget
 * @param {string} params.experienceLevel - 'beginner' | 'intermediate' | 'expert'
 * @param {string} params.status - Project status
 * @param {string} params.sort - 'oldest' | 'budget' | 'proposals'
 * @returns {Promise} Projects list with pagination
 */
export const getAllProjects = async (params = {}) => {
  const response = await api.get('/projects', { params });
  return response.data;
};

/**
 * Get single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise} Project details
 */
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

/**
 * Get similar projects
 * @param {string} projectId - Project ID
 * @returns {Promise} Similar projects list
 */
export const getSimilarProjects = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/similar`);
  return response.data;
};

/**
 * Get client's own projects
 * @returns {Promise} Client's projects list
 */
export const getMyProjects = async () => {
  const response = await api.get('/projects/my/projects');
  return response.data;
};

/**
 * Create new project (Client only)
 * @param {Object} data - Project data
 * @returns {Promise} Created project
 */
export const createProject = async (data) => {
  const response = await api.post('/projects', data);
  return response.data;
};

/**
 * Update project (Client only)
 * @param {string} projectId - Project ID
 * @param {Object} data - Updated project data
 * @returns {Promise} Updated project
 */
export const updateProject = async (projectId, data) => {
  const response = await api.put(`/projects/${projectId}`, data);
  return response.data;
};

/**
 * Delete project (Client only)
 * @param {string} projectId - Project ID
 * @returns {Promise} Delete confirmation
 */
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

/**
 * Update project status (Client only)
 * @param {string} projectId - Project ID
 * @param {string} status - New status
 * @returns {Promise} Updated status
 */
export const updateProjectStatus = async (projectId, status) => {
  const response = await api.patch(`/projects/${projectId}/status`, { status });
  return response.data;
};

// admin

export const getAllProjectsAdmin = async (params = {}) => {
  const response = await api.get('/projects/admin/all', { params });
  return response.data;
};
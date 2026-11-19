// client/src/services/category.service.js
import api from './api';

/**
 * Get all active categories
 * @param {Object} params - Query parameters
 * @returns {Promise} Categories list
 */
export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Get single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise} Category details
 */
export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

/**
 * Get projects by category
 * @param {string} categoryId - Category ID
 * @returns {Promise} Projects list
 */
export const getProjectsByCategory = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/projects`);
  return response.data;
};

/**
 * Create category (Admin only)
 * @param {Object} data - Category data
 * @returns {Promise} Created category
 */
export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data;
};

/**
 * Update category (Admin only)
 * @param {string} categoryId - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise} Updated category
 */
export const updateCategory = async (categoryId, data) => {
  const response = await api.put(`/categories/${categoryId}`, data);
  return response.data;
};

/**
 * Delete category (Admin only)
 * @param {string} categoryId - Category ID
 * @returns {Promise} Delete confirmation
 */
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
};
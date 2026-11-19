// client/src/services/skill.service.js
import api from './api';

/**
 * Get all skills from backend
 * @param {Object} params - Query parameters (search, category, etc.)
 * @returns {Promise<Object>} Response with skills array
 */
export const getAllSkills = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/skills${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

/**
 * Get popular skills
 * @returns {Promise<Object>} Response with popular skills
 */
export const getPopularSkills = async () => {
  const response = await api.get('/skills/popular');
  return response.data;
};

/**
 * Get skill by ID
 * @param {string} skillId - Skill ID
 * @returns {Promise<Object>} Response with skill details
 */
export const getSkillById = async (skillId) => {
  const response = await api.get(`/skills/${skillId}`);
  return response.data;
};

/**
 * Search skills by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} Response with matching skills
 */
export const searchSkills = async (searchTerm) => {
  const response = await api.get(`/skills?search=${encodeURIComponent(searchTerm)}`);
  return response.data;
};

/**
 * Create new skill (Admin only)
 * @param {Object} skillData - { name, category }
 * @returns {Promise<Object>} Response with created skill
 */
export const createSkill = async (skillData) => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

/**
 * Update skill (Admin only)
 * @param {string} skillId - Skill ID
 * @param {Object} skillData - Updated data
 * @returns {Promise<Object>} Response with updated skill
 */
export const updateSkill = async (skillId, skillData) => {
  const response = await api.put(`/skills/${skillId}`, skillData);
  return response.data;
};

/**
 * Delete skill (Admin only)
 * @param {string} skillId - Skill ID
 * @returns {Promise<Object>} Response
 */
export const deleteSkill = async (skillId) => {
  const response = await api.delete(`/skills/${skillId}`);
  return response.data;
};
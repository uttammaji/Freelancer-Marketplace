// client/src/services/portfolio.service.js
import api from './api';

/**
 * Add portfolio item (Freelancer only)
 */
export const addPortfolioItem = async (data) => {
  const response = await api.post('/portfolios', data); // ✅ Plural
  return response.data;
};

/**
 * Get current user's portfolio (Freelancer only)
 */
export const getMyPortfolio = async () => {
  const response = await api.get('/portfolios/my'); // ✅ Plural
  return response.data;
};

/**
 * Get portfolio by user ID (Public)
 */
export const getUserPortfolio = async (userId) => {
  const response = await api.get(`/portfolios/user/${userId}`); // ✅ Plural
  return response.data;
};

/**
 * Get single portfolio item (Public)
 */
export const getPortfolioById = async (portfolioId) => {
  const response = await api.get(`/portfolios/${portfolioId}`); // ✅ Plural
  return response.data;
};

/**
 * Update portfolio item (Freelancer only - owner)
 */
export const updatePortfolioItem = async (portfolioId, data) => {
  const response = await api.put(`/portfolios/${portfolioId}`, data); // ✅ Plural
  return response.data;
};

/**
 * Delete portfolio item (Freelancer only - owner)
 */
export const deletePortfolioItem = async (portfolioId) => {
  const response = await api.delete(`/portfolios/${portfolioId}`); // ✅ Plural
  return response.data;
};

/**
 * Get featured portfolio items (Public)
 */
export const getFeaturedPortfolio = async () => {
  const response = await api.get('/portfolios/featured'); // ✅ Plural
  return response.data;
};
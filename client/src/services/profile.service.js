// client/src/services/profile.service.js
import api from './api';

// Get my profile
export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

// Create or update profile
export const saveProfile = async (profileData) => {
  const response = await api.post('/profile', profileData);
  return response.data;
};

// Get profile by user ID (public)
export const getProfileByUserId = async (userId) => {
  const response = await api.get(`/profile/user/${userId}`);
  return response.data;
};

// Get all freelancers
export const getAllFreelancers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/profile/freelancers${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

// Get all clients
export const getAllClients = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/profile/clients${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

// Delete profile
export const deleteProfile = async () => {
  const response = await api.delete('/profile');
  return response.data;
};

// Update availability (freelancer only)
export const updateAvailability = async (availabilityData) => {
  const response = await api.patch('/profile/availability', availabilityData);
  return response.data;
};
// client/src/services/auth.service.js
import api from './api';

// Register user - Step 1
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Verify registration OTP - Step 2
export const verifyRegistration = async (email, otp) => {
  const response = await api.post('/auth/verify-registration', { email, otp });
  return response.data;
};

// Resend registration OTP
export const resendRegistrationOTP = async (email) => {
  const response = await api.post('/auth/resend-registration-otp', { email });
  return response.data;
};

// Login - Step 1 (Password)
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Verify login OTP - Step 2
export const verifyLoginOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-login-otp', { email, otp });
  return response.data;
};

// Resend login OTP
export const resendLoginOTP = async (email) => {
  const response = await api.post('/auth/resend-login-otp', { email });
  return response.data;
};

// reset password - Step 1: Send reset OTP
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/send-reset-otp', { email });
  return response.data;
};

// reset password - Step 2: Verify reset OTP and update password
export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/auth/verify-reset-otp', { email, otp, newPassword });
  return response.data;
};

// Resend reset OTP
export const resendResetOTP = async (email) => {
  const response = await api.post('/auth/resend-reset-otp', { email });
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logout
export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Refresh token
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh-token');
  return response.data;
};
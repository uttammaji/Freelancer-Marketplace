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
// Update user avatar
export const updateAvatar = async (avatar, avatarPublicId) => {
  const response = await api.patch('/auth/avatar', { avatar, avatarPublicId });
  return response.data;
};



// ============ CHANGE PASSWORD ============

/**
 * Change password (logged-in user)
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

// ============ USERNAME CHANGE ============

/**
 * Change username
 */
export const changeUsername = async (username) => {
  const response = await api.patch('/auth/username', { username });
  return response.data;
};

// ============ PHONE VERIFICATION ============

/**
 * Send OTP to phone
 */
export const sendPhoneOTP = async (phone) => {
  const response = await api.post('/auth/send-phone-otp', { phone });
  return response.data;
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (phone, otp) => {
  const response = await api.post('/auth/verify-phone-otp', { phone, otp });
  return response.data;
};

// ============ PHONE CHANGE (DUAL OTP) ============

/**
 * Step 1: Initiate phone change - Send OTP to old phone
 */
export const changePhone = async (newPhone) => {
  const response = await api.post('/auth/change-phone', { newPhone });
  return response.data;
};

/**
 * Step 2: Verify old phone OTP
 */
export const verifyOldPhoneOTP = async (newPhone, oldPhoneOTP) => {
  const response = await api.post('/auth/verify-old-phone-otp', { newPhone, oldPhoneOTP });
  return response.data;
};

/**
 * Step 3: Verify new phone OTP - Complete change
 */
export const verifyNewPhoneOTP = async (newPhone, newPhoneOTP) => {
  const response = await api.post('/auth/verify-new-phone-otp', { newPhone, newPhoneOTP });
  return response.data;
};

// ============ EMAIL CHANGE ============

/**
 * Step 1: Request email change
 */
export const changeEmail = async (newEmail) => {
  const response = await api.post('/auth/change-email', { newEmail });
  return response.data;
};

/**
 * Step 2: Verify email change with both OTPs
 */
export const verifyEmailChange = async (newEmail, oldEmailOTP, newEmailOTP) => {
  const response = await api.post('/auth/verify-email-change', { 
    newEmail, 
    oldEmailOTP, 
    newEmailOTP 
  });
  return response.data;
};

// ============ GOOGLE OAUTH ============

/**
 * Get Google OAuth URL
 */
export const getGoogleAuthUrl = () => {
  return `${import.meta.env.VITE_API_URL}/auth/google`;
};

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = async (token) => {
  if (token) {
    localStorage.setItem('skillhire_token', token);
  }
  return token;
};

export const updateRole = async (role) => {
  const response = await api.patch('/auth/google/role', { role });  
  return response.data;
};
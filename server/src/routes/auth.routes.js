// server/src/routes/auth.routes.js
import express from 'express';
import { 
  register,
  login, 
  getMe, 
  logout, 
  refreshToken,
  sendResetOTP,
  verifyResetOTP,
  updateAvatar,
  changePassword,
   changeUsername,
  changePhone,
  verifyOldPhoneOTP,
  verifyNewPhoneOTP
} from '../controllers/auth/auth.controller.js';
import {
  verifyRegistration,
  resendRegistrationOTP,
  resendLoginOTP,
  verifyLoginOTP,
  resendResetOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
  changeEmail,
  verifyEmailChange,
 
} from '../controllers/auth/otp.controller.js';
import { googleAuth, googleCallback, updateRole } from '../controllers/auth/googleAuth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============

// Registration
router.post('/register', register);
router.post('/verify-registration', verifyRegistration);
router.post('/resend-registration-otp', resendRegistrationOTP);

// Login (2FA)
router.post('/login', login);                          
router.post('/verify-login-otp', verifyLoginOTP);      
router.post('/resend-login-otp', resendLoginOTP);  

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);



// Password Reset
router.post('/send-reset-otp', sendResetOTP);   
router.post('/verify-reset-otp', verifyResetOTP); 
router.post('/resend-reset-otp', resendResetOTP);



// Token
router.post('/refresh-token', refreshToken);

// ============ PROTECTED ROUTES ============
// Update user role after Google OAuth
router.patch('/google/role', protect, updateRole);

// User info
router.get('/me', protect, getMe);

// Avatar
router.patch('/avatar', protect, updateAvatar);

// Change Password
router.post('/change-password', protect, changePassword);

// Phone Verification
router.post('/send-phone-otp', protect, sendPhoneOTP);
router.post('/verify-phone-otp', protect, verifyPhoneOTP);

// Phone Change
router.post('/change-phone', protect, changePhone);
router.post('/verify-old-phone-otp', protect, verifyOldPhoneOTP);
router.post('/verify-new-phone-otp', protect, verifyNewPhoneOTP);

// Email Change
router.post('/change-email', protect, changeEmail);
router.post('/verify-email-change', protect, verifyEmailChange);

//change username
router.patch('/username', protect, changeUsername);

// Logout
router.post('/logout', protect, logout);

export default router;
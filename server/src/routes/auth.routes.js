// server/src/routes/auth.routes.js
import express from 'express';
import { 
  register,
  login, 
  getMe, 
  logout, 
  refreshToken,
 sendResetOTP,
 verifyResetOTP
} from '../controllers/auth.controller.js';
import {
  verifyRegistration,
  resendRegistrationOTP,
  resendLoginOTP,
  verifyLoginOTP,
  resendResetOTP
} from '../controllers/otp.controller.js';
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

// Password Reset
router.post('/send-reset-otp', sendResetOTP);   
router.post('/verify-reset-otp', verifyResetOTP); 
router.post('/resend-reset-otp', resendResetOTP);

// Token
router.post('/refresh-token', refreshToken);

// ============ PROTECTED ROUTES ============
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
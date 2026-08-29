// server/src/controllers/googleAuth.controller.js
import { asyncHandler, AppError } from '../../middleware/error.middleware.js';
import { User } from '../../models/user.models.js';
import { generateToken, generateRefreshToken } from '../../utils/generateToken.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { welcomeEmailTemplate } from '../../utils/emailTemplates.js';
import { hashPassword } from '../../utils/password.utils.js';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

/**
 * Step 1: Redirect to Google OAuth
 * @route GET /api/auth/google
 * @access Public
 */
export const googleAuth = asyncHandler(async (req, res, next) => {
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'profile email openid',
    access_type: 'online',
    prompt: 'select_account',
  });

  res.redirect(`${googleAuthUrl}?${params.toString()}`);
});

/**
 * Step 2: Google OAuth callback
 * @route GET /api/auth/google/callback
 * @access Public
 */
export const googleCallback = asyncHandler(async (req, res, next) => {
  const { code, error } = req.query;

  // Check for OAuth error
  if (error) {
    throw new AppError('Google OAuth failed', 400);
  }

  if (!code) {
    throw new AppError('No authorization code provided', 400);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get tokens');
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const { id: googleId, email, name, picture } = googleUser;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if email already exists
      user = await User.findOne({ email });

      if (user) {
        // Link Google to existing account
        user.googleId = googleId;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        // Create new user with Google
        user = await User.create({
          name,
          email,
          username: email.split('@')[0] + '-' + Date.now().toString(36),
          password: await hashPassword(Math.random().toString(36).slice(-8)), // Random password
          role: 'client', // Default role for Google signup
          googleId,
          avatar: picture || '',
          isEmailVerified: true, // Google emails are verified
        });

        // Send welcome email
        try {
          await sendEmail({
            email: user.email,
            subject: 'Welcome to Freelancer Marketplace',
            html: welcomeEmailTemplate({ name: user.name, role: user.role }),
          });
        } catch (emailError) {
          console.error('Welcome email failed:', emailError.message);
        }
      }
    }

    // Check if blocked
    if (user.isBlocked) {
      throw new AppError('Your account has been blocked', 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id, user.tokenVersion);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with token
    const frontendURL = process.env.CLIENT_URL;
    res.redirect(`${frontendURL}/auth/google/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    const frontendURL = process.env.CLIENT_URL;
    res.redirect(`${frontendURL}/login?error=${encodeURIComponent(error.message)}`);
  }
});
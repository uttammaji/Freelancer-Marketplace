// server/src/controllers/auth/googleAuth.controller.js
import { asyncHandler, AppError } from '../../middleware/error.middleware.js';
import { User } from '../../models/user.models.js';
import { Profile } from '../../models/profile.model.js';
import { generateToken, generateRefreshToken } from '../../utils/generateToken.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { welcomeEmailTemplate } from '../../utils/emailTemplates.js';
import { hashPassword } from '../../utils/password.utils.js';

// ============ CONFIGURATION ============

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ============ HELPERS ============

/**
 * Parse OAuth state parameter
 * Format: "intent:role" (e.g., "register:freelancer", "login:client")
 */
const parseOAuthState = (state) => {
  const [intent = 'login', role = 'client'] = (state || 'login:client').split(':');
  return { intent, role };
};

/**
 * Generate unique username from email
 */
const generateUsername = (email) => {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${base}-${Date.now().toString(36)}`;
};

/**
 * Create empty profile for new user
 */
const createEmptyProfile = async (userId, role) => {
  await Profile.create({
    userId,
    role,
    bio: '',
    location: { country: '', state: '', city: '' },
    languages: [],
    skills: [],
    hourlyRate: 0,
    experienceYears: 0,
    availability: { status: 'available', hoursPerWeek: 40 },
    education: [],
    completedProjects: 0,
    totalEarnings: 0,
    rating: { average: 0, count: 0 },
    totalSpent: 0,
    projectsPosted: 0,
    totalHired: 0,
    profileCompletion: 0,
    isVerified: false,
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Freelancer Marketplace',
      html: welcomeEmailTemplate({ name: user.name, role: user.role }),
    });
  } catch (emailError) {
    console.error('Welcome email failed:', emailError.message);
  }
};

/**
 * Exchange Google code for tokens
 */
const exchangeGoogleCode = async (code) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to exchange code');
  }

  return data;
};

/**
 * Fetch Google user info
 */
const fetchGoogleUserInfo = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to get user info from Google');
  }

  return data;
};

/**
 * Generate and set auth tokens
 */
const generateAndSetTokens = (user, res) => {
  const token = generateToken(user._id, user.tokenVersion);
  const refreshToken = generateRefreshToken(user._id, user.tokenVersion);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// ============ CONTROLLERS ============

/**
 * Step 1: Redirect to Google OAuth
 * @route GET /api/auth/google?intent=login|register&role=client|freelancer
 * @access Public
 */
export const googleAuth = asyncHandler(async (req, res, next) => {
  const intent = req.query.intent || 'login';
  const role = req.query.role || 'client';

  // Validate inputs
  if (!['login', 'register'].includes(intent)) {
    throw new AppError('Invalid intent parameter', 400);
  }

  if (!['client', 'freelancer'].includes(role)) {
    throw new AppError('Invalid role parameter', 400);
  }

  // Build Google OAuth URL
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'profile email openid',
    access_type: 'online',
    prompt: 'select_account',
    state: `${intent}:${role}`, 
  });

  // Redirect to Google
  res.redirect(`${googleAuthUrl}?${params.toString()}`);
});

/**
 * Step 2: Google OAuth callback
 * @route GET /api/auth/google/callback
 * @access Public
 */
export const googleCallback = asyncHandler(async (req, res, next) => {
  const { code, error, state } = req.query;

  // Handle OAuth errors
  if (error) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Parse state to get intent and role
    const { intent, role: selectedRole } = parseOAuthState(state);

    // Exchange code for tokens
    const tokenData = await exchangeGoogleCode(code);

    // Get user info from Google
    const googleUser = await fetchGoogleUserInfo(tokenData.access_token);
    const { id: googleId, email, name, picture } = googleUser;

    let isNewUser = false;
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        // Existing user → Link Google account
        user.googleId = googleId;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
        isNewUser = false;
      } else {
        // User not found → Check intent
        if (intent === 'register') {
          // Create new user with selected role
          user = await User.create({
            name,
            email,
            username: generateUsername(email),
            password: await hashPassword(Math.random().toString(36).slice(-8)),
            role: selectedRole,
            googleId,
            avatar: picture || '',
            isEmailVerified: true,
          });
          isNewUser = true;

          // Create empty profile
          await createEmptyProfile(user._id, selectedRole);

          // Send welcome email
          await sendWelcomeEmail(user);
        } else {
          // Login mode - Account not found
          return res.redirect(`${FRONTEND_URL}/login?error=account_not_found`);
        }
      }
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.redirect(`${FRONTEND_URL}/login?error=account_blocked`);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateAndSetTokens(user, res);

    res.redirect(`${FRONTEND_URL}/auth/google/callback?token=${token}`);

    res.redirect(`${FRONTEND_URL}/auth/google/callback?${redirectParams.toString()}`);
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Step 3: Update role for Google users
 * @route PATCH /api/auth/google/role
 * @access Private
 */
export const updateRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['client', 'freelancer'].includes(role)) {
    throw new AppError('Invalid role specified', 400);
  }

   if (!req.user || !req.user.id) {
    throw new AppError('Not authorized', 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update User role
  user.role = role;
  await user.save();

  // Update Profile role or create
  let profile = await Profile.findOne({ userId: user._id });

  if (profile) {
    profile.role = role;
    await profile.save();
  } else {
    await createEmptyProfile(user._id, role);
  }

  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    user: {
      id: user._id,
      role: user.role,
    },
  });
});
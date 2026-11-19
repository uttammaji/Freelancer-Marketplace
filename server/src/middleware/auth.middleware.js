import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import redis from '../config/redis.config.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Prioritize explicit Authorization header over potentially stale cookies
    const authHeader = req.headers ?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies ?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    // Check if token is blacklisted (e.g., after logout)
    const isBlacklisted = await redis.get(`bl:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token has been revoked',
      });
    }

    // Verify signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError' ?
          'Not authorized, token expired' :
          'Not authorized, invalid token';
      return res.status(401).json({ success: false, message });
    }

    // Attach user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists',
      });
    }

    // Optional: reject tokens issued before a password change / forced logout
    if (user.tokenVersion !== undefined && decoded.tv !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is no longer valid',
      });
    }

    req.user = user;
    req.token = token; // handy for a logout handler that blacklists it
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

// Optional: role-based authorization
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: insufficient permissions',
    });
  }
  next();
};
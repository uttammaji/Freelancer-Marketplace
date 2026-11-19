// server/src/utils/generateToken.js
import jwt from 'jsonwebtoken';

/**
 * Generate access token (short-lived)
 * @param {string} userId - User ID
 * @param {number} tokenVersion - Token version for rotation
 * @returns {string} JWT token
 */
export const generateToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { 
      id: userId,
      version: tokenVersion 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE  }
  );
};

/**
 * Generate refresh token (long-lived)
 * @param {string} userId - User ID
 * @param {number} tokenVersion - Token version for rotation
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { 
      id: userId,
      version: tokenVersion 
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE  }
  );
};

/**
 * Verify token and return decoded payload
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
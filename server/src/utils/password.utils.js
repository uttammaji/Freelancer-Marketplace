// server/src/utils/password.utils.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Creates a deterministic, fixed-length string combining password and pepper.
  * This ensures that the same password always produces the same hash, while still being secure.
 */
const getPepperedHash = (password) => {
  const pepper = process.env.PASSWORD_PEPPER;
  return crypto
    .createHmac('sha256', pepper)
    .update(password)
    .digest('hex'); //  returns a 64-character string
};

// Hash password with pepper securely
export const hashPassword = async (password) => {
  const processedPassword = getPepperedHash(password);
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(processedPassword, salt);
};

// Compare password with pepper securely
export const comparePassword = async (password, hashedPassword) => {
  const processedPassword = getPepperedHash(password);
  return await bcrypt.compare(processedPassword, hashedPassword);
};

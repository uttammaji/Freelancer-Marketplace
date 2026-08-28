// server/src/utils/cache.utils.js
import redis from '../config/redis.config.js';

// Set cache with expiry
export const setCache = async (key, data, expiry = 300) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', expiry);
    return true;
  } catch (error) {
    console.error('Cache set error:', error.message);
    return false;
  }
};

// Get cache
export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
};

// Delete cache
export const deleteCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error.message);
    return false;
  }
};

// Delete cache by pattern
export const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache pattern delete error:', error.message);
    return false;
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    await redis.flushall();
    return true;
  } catch (error) {
    console.error('Cache clear error:', error.message);
    return false;
  }
};
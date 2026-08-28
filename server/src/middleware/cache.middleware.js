// server/src/middleware/cache.middleware.js
import { getCache, setCache } from '../utils/cache.utils.js';

// Cache middleware
export const cacheMiddleware = (keyPrefix, expiry = 300) => {
  return async (req, res, next) => {
    // Skip caching for authenticated requests
    if (req.user) {
      return next();
    }

    // Build cache key
    const key = `${keyPrefix}:${req.originalUrl}`;
    // console.log('Cache key:', key); 

    try {
      // Check cache
      const cachedData = await getCache(key);
      
      if (cachedData) {
        // console.log('Cache HIT:', key); 
        return res.status(200).json({
          success: true,
          fromCache: true,
          ...cachedData
        });
      }

      // console.log('Cache MISS:', key); 

      // Store response in cache
      const originalJson = res.json;
      res.json = function(data) {
        if (data.success) {
          // console.log('Storing in cache:', key);
          
          setCache(key, data, expiry);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};
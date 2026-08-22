// server/src/middleware/role.middleware.js

// Generic role authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Specific role middlewares for convenience
export const isClient = authorize('client');
export const isFreelancer = authorize('freelancer');
export const isAdmin = authorize('admin');
export const isClientOrAdmin = authorize('client', 'admin');
export const isFreelancerOrAdmin = authorize('freelancer', 'admin');
export const isClientOrFreelancer = authorize('client', 'freelancer');
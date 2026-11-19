// server/src/middleware/role.middleware.js

export const authorize = (...roles) => {
  return (req, res, next) => {
   
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. '${req.user.role}' role is not authorized to access this route`
      });
    }
    
    next();
  };
};

export const isClient = authorize('client');
export const isFreelancer = authorize('freelancer');
export const isAdmin = authorize('admin');
export const isClientOrAdmin = authorize('client', 'admin');
export const isFreelancerOrAdmin = authorize('freelancer', 'admin');
export const isClientOrFreelancer = authorize('client', 'freelancer');
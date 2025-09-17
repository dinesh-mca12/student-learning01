import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - doesn't require token but adds user to req if token exists
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user owns resource
export const checkOwnership = (Model, param = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[param]);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check different ownership patterns
      const userId = req.user._id.toString();
      
      if (resource.user_id && resource.user_id.toString() === userId) {
        req.resource = resource;
        return next();
      }
      
      if (resource.teacher_id && resource.teacher_id.toString() === userId) {
        req.resource = resource;
        return next();
      }
      
      if (resource.created_by && resource.created_by.toString() === userId) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      next(error);
    }
  };
};

// Check if user is enrolled in course
export const checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Teachers can access any course they created
    if (req.user.role === 'teacher') {
      const Course = (await import('../models/Course.js')).default;
      const course = await Course.findById(courseId);
      
      if (course && course.teacher_id.toString() === userId.toString()) {
        return next();
      }
    }

    // Check if user is enrolled
    const Enrollment = (await import('../models/Course.js')).default; // This would be a separate Enrollment model in a real app
    
    // For now, we'll allow access if user exists
    // In a real application, you'd check an Enrollment collection
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting middleware
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip + req.user?._id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [reqKey, timestamps] of requests.entries()) {
      requests.set(reqKey, timestamps.filter(time => time > windowStart));
      if (requests.get(reqKey).length === 0) {
        requests.delete(reqKey);
      }
    }

    // Check current user requests
    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};
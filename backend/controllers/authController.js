import { body } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/auth.js';
import { asyncHandler, sendSuccessResponse, sendErrorResponse } from '../utils/helpers.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { fullName, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendErrorResponse(res, 400, 'User already exists with this email');
  }

  // Create user
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role: role || 'student'
  });

  // Generate token
  const token = generateToken(user._id);

  sendSuccessResponse(res, 201, 'User registered successfully', {
    user: user.getPublicProfile(),
    token
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return sendErrorResponse(res, 401, 'Invalid email or password');
  }

  if (!user.isActive) {
    return sendErrorResponse(res, 401, 'Your account has been deactivated. Please contact support.');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user._id);

  sendSuccessResponse(res, 200, 'Login successful', {
    user: user.getPublicProfile(),
    token
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  sendSuccessResponse(res, 200, 'Profile retrieved successfully', {
    user: user.getPublicProfile()
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, bio, avatarUrl } = req.body;

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  // Update allowed fields
  if (fullName) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  const updatedUser = await user.save();

  sendSuccessResponse(res, 200, 'Profile updated successfully', {
    user: updatedUser.getPublicProfile()
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendErrorResponse(res, 400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    return sendErrorResponse(res, 400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return sendErrorResponse(res, 400, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccessResponse(res, 200, 'Password changed successfully');
});

// Validation rules
export const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];
const { body } = require('express-validator');

// Auth validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('role')
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL')
];

// Course validation rules
const createCourseValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('courseCode')
    .trim()
    .isLength({ min: 6, max: 10 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Course code must be 6-10 characters long and contain only uppercase letters and numbers'),
  body('coverImageUrl')
    .optional()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Max students must be between 1 and 200')
];

const updateCourseValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('coverImageUrl')
    .optional()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Max students must be between 1 and 200')
];

// Assignment validation rules
const createAssignmentValidation = [
  body('courseId')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ObjectId'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('instructions')
    .optional()
    .isLength({ max: 3000 })
    .withMessage('Instructions cannot be more than 3000 characters'),
  body('dueDate')
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
  body('totalPoints')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total points must be between 1 and 1000')
];

const updateAssignmentValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('instructions')
    .optional()
    .isLength({ max: 3000 })
    .withMessage('Instructions cannot be more than 3000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
  body('totalPoints')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total points must be between 1 and 1000'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'closed'])
    .withMessage('Status must be draft, published, or closed')
];

// Submission validation rules
const createSubmissionValidation = [
  body('assignmentId')
    .isMongoId()
    .withMessage('Assignment ID must be a valid MongoDB ObjectId'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const gradeSubmissionValidation = [
  body('grade')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Grade must be a positive number'),
  body('feedback')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot be more than 2000 characters')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  createCourseValidation,
  updateCourseValidation,
  createAssignmentValidation,
  updateAssignmentValidation,
  createSubmissionValidation,
  gradeSubmissionValidation
};
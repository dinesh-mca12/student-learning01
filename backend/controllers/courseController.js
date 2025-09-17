import { body, validationResult } from 'express-validator';
import Course from '../models/Course.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import User from '../models/User.js';
import { asyncHandler, sendSuccessResponse, sendErrorResponse, paginate } from '../utils/helpers.js';

/**
 * @desc    Get all courses with optional filtering
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    teacher, 
    difficulty, 
    enrolled,
    my_courses 
  } = req.query;

  let query = Course.find({ isActive: true });

  // Text search
  if (search) {
    query = query.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Filter by teacher
  if (teacher) {
    query = query.find({ teacher });
  }

  // Filter by difficulty
  if (difficulty) {
    query = query.find({ difficulty });
  }

  // Filter by user's enrolled courses (requires auth)
  if (enrolled === 'true' && req.user) {
    const enrollments = await CourseEnrollment.find({ 
      student: req.user._id, 
      status: 'active' 
    }).select('course');
    const enrolledCourseIds = enrollments.map(e => e.course);
    query = query.find({ _id: { $in: enrolledCourseIds } });
  }

  // Filter user's own courses (teachers only)
  if (my_courses === 'true' && req.user && req.user.role === 'teacher') {
    query = query.find({ teacher: req.user._id });
  }

  // Populate teacher info
  query = query.populate('teacher', 'fullName email avatarUrl');

  const { results: courses, pagination } = await paginate(query, page, limit);

  // If user is logged in, check enrollment status for each course
  if (req.user) {
    const enrollments = await CourseEnrollment.find({
      student: req.user._id,
      course: { $in: courses.map(c => c._id) }
    });

    const enrollmentMap = enrollments.reduce((acc, enrollment) => {
      acc[enrollment.course.toString()] = enrollment;
      return acc;
    }, {});

    courses.forEach(course => {
      course._doc.isEnrolled = !!enrollmentMap[course._id.toString()];
      course._doc.enrollmentStatus = enrollmentMap[course._id.toString()]?.status || null;
    });
  }

  sendSuccessResponse(res, 200, 'Courses retrieved successfully', {
    courses,
    pagination
  });
});

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'fullName email avatarUrl bio');

  if (!course || !course.isActive) {
    return sendErrorResponse(res, 404, 'Course not found');
  }

  // Check if user is enrolled (if authenticated)
  let isEnrolled = false;
  let enrollmentStatus = null;
  
  if (req.user) {
    const enrollment = await CourseEnrollment.findOne({
      course: course._id,
      student: req.user._id
    });
    
    isEnrolled = !!enrollment;
    enrollmentStatus = enrollment?.status || null;
  }

  // Get enrollment count
  const enrollmentCount = await CourseEnrollment.countDocuments({
    course: course._id,
    status: 'active'
  });

  sendSuccessResponse(res, 200, 'Course retrieved successfully', {
    course: {
      ...course.toJSON(),
      isEnrolled,
      enrollmentStatus,
      enrollmentCount
    }
  });
});

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Private (Teachers only)
 */
export const createCourse = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { title, description, code, difficulty, tags, enrollmentLimit } = req.body;

  // Check if course code already exists
  const existingCourse = await Course.findOne({ code: code.toUpperCase() });
  if (existingCourse) {
    return sendErrorResponse(res, 400, 'Course code already exists');
  }

  const course = await Course.create({
    title,
    description,
    code: code.toUpperCase(),
    teacher: req.user._id,
    difficulty: difficulty || 'beginner',
    tags: tags || [],
    enrollmentLimit
  });

  const populatedCourse = await Course.findById(course._id)
    .populate('teacher', 'fullName email avatarUrl');

  sendSuccessResponse(res, 201, 'Course created successfully', {
    course: populatedCourse
  });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Course teacher only)
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return sendErrorResponse(res, 404, 'Course not found');
  }

  // Check if user is the course teacher
  if (course.teacher.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'Not authorized to update this course');
  }

  const { title, description, difficulty, tags, enrollmentLimit, isActive } = req.body;

  // Update fields
  if (title) course.title = title;
  if (description) course.description = description;
  if (difficulty) course.difficulty = difficulty;
  if (tags !== undefined) course.tags = tags;
  if (enrollmentLimit !== undefined) course.enrollmentLimit = enrollmentLimit;
  if (isActive !== undefined) course.isActive = isActive;

  const updatedCourse = await course.save();
  const populatedCourse = await Course.findById(updatedCourse._id)
    .populate('teacher', 'fullName email avatarUrl');

  sendSuccessResponse(res, 200, 'Course updated successfully', {
    course: populatedCourse
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Course teacher only)
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return sendErrorResponse(res, 404, 'Course not found');
  }

  // Check if user is the course teacher
  if (course.teacher.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'Not authorized to delete this course');
  }

  // Check if course has enrollments
  const enrollmentCount = await CourseEnrollment.countDocuments({ 
    course: course._id 
  });

  if (enrollmentCount > 0) {
    return sendErrorResponse(res, 400, 'Cannot delete course with enrolled students. Please remove all enrollments first.');
  }

  await Course.findByIdAndDelete(req.params.id);

  sendSuccessResponse(res, 200, 'Course deleted successfully');
});

/**
 * @desc    Enroll in course
 * @route   POST /api/courses/:id/enroll
 * @access  Private (Students only)
 */
export const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course || !course.isActive) {
    return sendErrorResponse(res, 404, 'Course not found');
  }

  // Check if user is already enrolled
  const existingEnrollment = await CourseEnrollment.findOne({
    course: course._id,
    student: req.user._id
  });

  if (existingEnrollment) {
    return sendErrorResponse(res, 400, 'Already enrolled in this course');
  }

  // Check enrollment limit
  if (course.enrollmentLimit) {
    const currentEnrollments = await CourseEnrollment.countDocuments({
      course: course._id,
      status: 'active'
    });

    if (currentEnrollments >= course.enrollmentLimit) {
      return sendErrorResponse(res, 400, 'Course enrollment limit reached');
    }
  }

  // Create enrollment
  await CourseEnrollment.create({
    course: course._id,
    student: req.user._id
  });

  sendSuccessResponse(res, 201, 'Successfully enrolled in course', {
    course: {
      id: course._id,
      title: course.title,
      code: course.code
    }
  });
});

/**
 * @desc    Unenroll from course
 * @route   DELETE /api/courses/:id/enroll
 * @access  Private (Students only)
 */
export const unenrollFromCourse = asyncHandler(async (req, res) => {
  const enrollment = await CourseEnrollment.findOne({
    course: req.params.id,
    student: req.user._id
  });

  if (!enrollment) {
    return sendErrorResponse(res, 400, 'Not enrolled in this course');
  }

  await CourseEnrollment.findByIdAndDelete(enrollment._id);

  sendSuccessResponse(res, 200, 'Successfully unenrolled from course');
});

// Validation rules
export const validateCreateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Course description must be between 10 and 2000 characters'),
  body('code')
    .trim()
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Course code must be 3-10 alphanumeric characters'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('enrollmentLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Enrollment limit must be a positive integer')
];
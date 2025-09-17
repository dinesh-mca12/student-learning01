import { body, validationResult } from 'express-validator';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Course from '../models/Course.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import { asyncHandler, sendSuccessResponse, sendErrorResponse, paginate } from '../utils/helpers.js';

/**
 * @desc    Get assignments for user
 * @route   GET /api/assignments
 * @access  Private
 */
export const getAssignments = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    course_id,
    status,
    my_assignments
  } = req.query;

  let query = {};

  // Filter by course if specified
  if (course_id) {
    query.course = course_id;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Role-based filtering
  if (req.user.role === 'teacher') {
    if (my_assignments === 'true') {
      // Teacher's own assignments
      query.teacher = req.user._id;
    } else {
      // All assignments from teacher's courses
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }
  } else {
    // Student: only assignments from enrolled courses
    const enrollments = await CourseEnrollment.find({ 
      student: req.user._id, 
      status: 'active' 
    }).select('course');
    const enrolledCourseIds = enrollments.map(e => e.course);
    query.course = { $in: enrolledCourseIds };
  }

  let assignmentQuery = Assignment.find(query)
    .populate('course', 'title code')
    .populate('teacher', 'fullName email')
    .sort({ dueDate: 1 });

  const { results: assignments, pagination } = await paginate(assignmentQuery, page, limit);

  // If student, get submission status for each assignment
  if (req.user.role === 'student') {
    const submissions = await Submission.find({
      student: req.user._id,
      assignment: { $in: assignments.map(a => a._id) }
    });

    const submissionMap = submissions.reduce((acc, submission) => {
      acc[submission.assignment.toString()] = submission;
      return acc;
    }, {});

    assignments.forEach(assignment => {
      assignment._doc.submission = submissionMap[assignment._id.toString()] || null;
      assignment._doc.isSubmitted = !!submissionMap[assignment._id.toString()];
    });
  }

  sendSuccessResponse(res, 200, 'Assignments retrieved successfully', {
    assignments,
    pagination
  });
});

/**
 * @desc    Create new assignment
 * @route   POST /api/assignments
 * @access  Private (Teachers only)
 */
export const createAssignment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { title, description, instructions, course_id, dueDate, totalPoints } = req.body;

  // Check if teacher owns the course
  const course = await Course.findOne({ _id: course_id, teacher: req.user._id });
  if (!course) {
    return sendErrorResponse(res, 403, 'You can only create assignments for your own courses');
  }

  const assignment = await Assignment.create({
    title,
    description,
    instructions,
    course: course_id,
    teacher: req.user._id,
    dueDate: new Date(dueDate),
    totalPoints: totalPoints || 100,
    status: 'published' // Auto-publish for simplicity
  });

  const populatedAssignment = await Assignment.findById(assignment._id)
    .populate('course', 'title code')
    .populate('teacher', 'fullName email');

  sendSuccessResponse(res, 201, 'Assignment created successfully', {
    assignment: populatedAssignment
  });
});

/**
 * @desc    Submit assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Students only)
 */
export const submitAssignment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const assignmentId = req.params.id;

  // Check if assignment exists and is published
  const assignment = await Assignment.findOne({ 
    _id: assignmentId, 
    status: 'published' 
  }).populate('course');

  if (!assignment) {
    return sendErrorResponse(res, 404, 'Assignment not found or not available');
  }

  // Check if student is enrolled in the course
  const enrollment = await CourseEnrollment.findOne({
    course: assignment.course._id,
    student: req.user._id,
    status: 'active'
  });

  if (!enrollment) {
    return sendErrorResponse(res, 403, 'You must be enrolled in the course to submit assignments');
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user._id
  });

  if (existingSubmission) {
    return sendErrorResponse(res, 400, 'Assignment already submitted');
  }

  // Create submission
  const submission = await Submission.create({
    assignment: assignmentId,
    student: req.user._id,
    content,
    submittedAt: new Date()
  });

  const populatedSubmission = await Submission.findById(submission._id)
    .populate('assignment', 'title dueDate totalPoints')
    .populate('student', 'fullName email');

  sendSuccessResponse(res, 201, 'Assignment submitted successfully', {
    submission: populatedSubmission
  });
});

/**
 * @desc    Get assignment submissions (teachers only)
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Teachers only)
 */
export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;

  // Check if teacher owns the assignment
  const assignment = await Assignment.findOne({ 
    _id: assignmentId, 
    teacher: req.user._id 
  });

  if (!assignment) {
    return sendErrorResponse(res, 404, 'Assignment not found or access denied');
  }

  const submissions = await Submission.find({ assignment: assignmentId })
    .populate('student', 'fullName email avatarUrl')
    .populate('assignment', 'title totalPoints')
    .sort({ submittedAt: -1 });

  sendSuccessResponse(res, 200, 'Submissions retrieved successfully', {
    assignment: {
      id: assignment._id,
      title: assignment.title,
      totalPoints: assignment.totalPoints,
      dueDate: assignment.dueDate
    },
    submissions
  });
});

/**
 * @desc    Grade assignment submission
 * @route   PUT /api/assignments/:id/submissions/:submissionId/grade
 * @access  Private (Teachers only)
 */
export const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  if (grade < 0 || grade === undefined) {
    return sendErrorResponse(res, 400, 'Valid grade is required');
  }

  // Find submission and verify ownership
  const submission = await Submission.findById(submissionId)
    .populate({
      path: 'assignment',
      populate: {
        path: 'teacher',
        select: 'fullName'
      }
    });

  if (!submission) {
    return sendErrorResponse(res, 404, 'Submission not found');
  }

  if (submission.assignment.teacher._id.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 403, 'You can only grade assignments from your courses');
  }

  if (grade > submission.assignment.totalPoints) {
    return sendErrorResponse(res, 400, `Grade cannot exceed ${submission.assignment.totalPoints} points`);
  }

  // Update submission
  submission.grade = grade;
  submission.feedback = feedback || '';
  submission.gradedAt = new Date();
  submission.gradedBy = req.user._id;
  submission.status = 'graded';

  await submission.save();

  const populatedSubmission = await Submission.findById(submission._id)
    .populate('student', 'fullName email')
    .populate('assignment', 'title totalPoints')
    .populate('gradedBy', 'fullName');

  sendSuccessResponse(res, 200, 'Submission graded successfully', {
    submission: populatedSubmission
  });
});

// Validation rules
export const validateCreateAssignment = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Assignment title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('course_id')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('totalPoints')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total points must be between 1 and 1000')
];
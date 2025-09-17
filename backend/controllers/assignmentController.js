import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { isActive: true };

  // Filter by course
  if (req.query.courseId) {
    query.course_id = req.query.courseId;
  }

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Filter by difficulty
  if (req.query.difficulty) {
    query.difficulty = req.query.difficulty;
  }

  // Filter by teacher's courses for teachers
  if (req.user.role === 'teacher') {
    if (req.query.my === 'true') {
      const teacherCourses = await Course.find({ teacher_id: req.user._id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      query.course_id = { $in: courseIds };
    }
  }

  // Search
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter published assignments for students
  if (req.user.role === 'student') {
    query.isPublished = true;
  }

  const total = await Assignment.countDocuments(query);
  const assignments = await Assignment.find(query)
    .populate('course', 'title code teacher_id')
    .sort({ due_date: 1 })
    .limit(limit)
    .skip(startIndex);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  res.status(200).json({
    success: true,
    count: assignments.length,
    pagination,
    assignments
  });
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title code teacher_id')
    .populate('submissions', 'student_id content submitted_at grade');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if student can access assignment
  if (req.user.role === 'student' && !assignment.isPublished) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if teacher owns the course
  if (req.user.role === 'teacher' && assignment.course.teacher_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this assignment'
    });
  }

  res.status(200).json({
    success: true,
    assignment
  });
});

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher)
export const createAssignment = asyncHandler(async (req, res) => {
  // Check if teacher owns the course
  const course = await Course.findById(req.body.course_id);
  
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.teacher_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create assignment for this course'
    });
  }

  const assignment = await Assignment.create(req.body);

  res.status(201).json({
    success: true,
    assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher - Owner)
export const updateAssignment = asyncHandler(async (req, res) => {
  let assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Make sure user owns the course
  if (assignment.course.teacher_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('course', 'title code');

  res.status(200).json({
    success: true,
    assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher - Owner)
export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Make sure user owns the course
  if (assignment.course.teacher_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assignment'
    });
  }

  await assignment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  if (!assignment.isOpen()) {
    return res.status(400).json({
      success: false,
      message: 'Assignment is not open for submission'
    });
  }

  // In a real app, you'd create a Submission model
  // For demo purposes, we'll just return success
  const submissionData = {
    assignment_id: assignment._id,
    student_id: req.user._id,
    content: req.body.content,
    files: req.body.files || [],
    submitted_at: new Date()
  };

  // Calculate late penalty if applicable
  let penalty = 0;
  if (assignment.isOverdue()) {
    penalty = assignment.calculateLatePenalty(new Date());
  }

  res.status(200).json({
    success: true,
    message: 'Assignment submitted successfully',
    submission: submissionData,
    latePenalty: penalty
  });
});

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher - Owner)
export const getSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Make sure user owns the course
  if (assignment.course.teacher_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view submissions for this assignment'
    });
  }

  // In a real app, you'd fetch from Submission model
  const submissions = [];

  res.status(200).json({
    success: true,
    submissions
  });
});

// @desc    Grade assignment submission
// @route   PUT /api/assignments/:id/submissions/:submissionId/grade
// @access  Private (Teacher - Owner)
export const gradeSubmission = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Make sure user owns the course
  if (assignment.course.teacher_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to grade submissions for this assignment'
    });
  }

  const { grade, feedback } = req.body;

  if (grade < 0 || grade > assignment.max_points) {
    return res.status(400).json({
      success: false,
      message: `Grade must be between 0 and ${assignment.max_points}`
    });
  }

  // In a real app, you'd update the Submission model
  const gradedSubmission = {
    id: req.params.submissionId,
    grade,
    feedback,
    graded_at: new Date(),
    graded_by: req.user._id
  };

  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    submission: gradedSubmission
  });
});

// @desc    Get assignment statistics
// @route   GET /api/assignments/stats
// @access  Private (Teacher)
export const getAssignmentStats = asyncHandler(async (req, res) => {
  let query = {};

  // Filter by teacher's courses
  if (req.user.role === 'teacher') {
    const teacherCourses = await Course.find({ teacher_id: req.user._id }).select('_id');
    const courseIds = teacherCourses.map(course => course._id);
    query.course_id = { $in: courseIds };
  }

  const totalAssignments = await Assignment.countDocuments(query);
  const publishedAssignments = await Assignment.countDocuments({ ...query, isPublished: true });
  const overdueAssignments = await Assignment.countDocuments({ ...query, due_date: { $lt: new Date() } });

  const typeStats = await Assignment.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const difficultyStats = await Assignment.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      total: totalAssignments,
      published: publishedAssignments,
      overdue: overdueAssignments,
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      byDifficulty: difficultyStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    }
  });
});
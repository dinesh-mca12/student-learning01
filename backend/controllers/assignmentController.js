const { validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { course, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by course
    if (course) {
      query.courseId = course;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }

    // For students, only show published assignments from enrolled courses
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({ 
        enrolledStudents: req.user.id 
      }).select('_id');
      
      query.courseId = { $in: enrolledCourses.map(c => c._id) };
      query.status = 'published';
    }
    
    // For teachers, show assignments from their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ 
        teacherId: req.user.id 
      }).select('_id');
      
      query.courseId = { $in: teacherCourses.map(c => c._id) };
    }

    const assignments = await Assignment.find(query)
      .populate('courseId', 'title courseCode')
      .populate('createdBy', 'fullName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dueDate: 1 });

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: assignments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment
// @route   GET /api/v1/assignments/:id
// @access  Private
const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('courseId', 'title courseCode teacherId')
      .populate('createdBy', 'fullName email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user has access to this assignment
    if (req.user.role === 'student') {
      const course = await Course.findById(assignment.courseId._id);
      if (!course.enrolledStudents.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this assignment'
        });
      }
      
      // Only show published assignments to students
      if (assignment.status !== 'published') {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }
    }

    // Check if teacher owns the course
    if (req.user.role === 'teacher' && 
        assignment.courseId.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this assignment'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment
// @route   POST /api/v1/assignments
// @access  Private (Teacher only)
const createAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    // Check if course exists and user is the teacher
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create assignments for this course'
      });
    }

    // Add creator to req.body
    req.body.createdBy = req.user.id;

    const assignment = await Assignment.create(req.body);
    
    // Populate related fields
    await assignment.populate([
      { path: 'courseId', select: 'title courseCode' },
      { path: 'createdBy', select: 'fullName email' }
    ]);

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/v1/assignments/:id
// @access  Private (Teacher only - own assignments)
const updateAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    let assignment = await Assignment.findById(req.params.id).populate('courseId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Make sure user is course owner
    if (assignment.courseId.teacherId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this assignment'
      });
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'courseId', select: 'title courseCode' },
      { path: 'createdBy', select: 'fullName email' }
    ]);

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private (Teacher only - own assignments)
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('courseId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Make sure user is course owner
    if (assignment.courseId.teacherId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this assignment'
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
const { validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// @desc    Get submissions for an assignment (teacher) or user's submissions (student)
// @route   GET /api/v1/submissions
// @access  Private
const getSubmissions = async (req, res, next) => {
  try {
    const { assignment, student, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (req.user.role === 'student') {
      // Students can only see their own submissions
      query.studentId = req.user.id;
      
      // Filter by assignment if specified
      if (assignment) {
        query.assignmentId = assignment;
      }
    } else if (req.user.role === 'teacher') {
      // Teachers can see submissions for their assignments
      if (assignment) {
        // Verify teacher owns the assignment's course
        const assignmentDoc = await Assignment.findById(assignment).populate('courseId');
        if (!assignmentDoc || assignmentDoc.courseId.teacherId.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view these submissions'
          });
        }
        query.assignmentId = assignment;
      } else {
        // Get all assignments from teacher's courses
        const teacherCourses = await Course.find({ teacherId: req.user.id }).select('_id');
        const teacherAssignments = await Assignment.find({ 
          courseId: { $in: teacherCourses.map(c => c._id) }
        }).select('_id');
        
        query.assignmentId = { $in: teacherAssignments.map(a => a._id) };
      }
      
      // Filter by student if specified
      if (student) {
        query.studentId = student;
      }
    }

    const submissions = await Submission.find(query)
      .populate('assignmentId', 'title dueDate totalPoints courseId')
      .populate('studentId', 'fullName email')
      .populate('gradedBy', 'fullName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ submittedAt: -1 });

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single submission
// @route   GET /api/v1/submissions/:id
// @access  Private
const getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId', 'title dueDate totalPoints courseId')
      .populate('studentId', 'fullName email')
      .populate('gradedBy', 'fullName email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check authorization
    if (req.user.role === 'student') {
      if (submission.studentId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this submission'
        });
      }
    } else if (req.user.role === 'teacher') {
      // Get the course for this assignment
      const assignment = await Assignment.findById(submission.assignmentId._id).populate('courseId');
      if (assignment.courseId.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this submission'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Update submission
// @route   POST /api/v1/submissions
// @access  Private (Student only)
const createSubmission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { assignmentId, content, attachments } = req.body;

    // Check if assignment exists and is published
    const assignment = await Assignment.findById(assignmentId).populate('courseId');
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'Assignment is not published'
      });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.courseId._id);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    // Check if assignment is still open
    if (assignment.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Assignment is closed'
      });
    }

    // Check for existing submission
    let submission = await Submission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (submission) {
      // Update existing submission
      submission.content = content;
      submission.attachments = attachments || [];
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        assignmentId,
        studentId: req.user.id,
        content,
        attachments: attachments || [],
        status: 'submitted',
        submittedAt: new Date()
      });
    }

    // Populate fields
    await submission.populate([
      { path: 'assignmentId', select: 'title dueDate totalPoints' },
      { path: 'studentId', select: 'fullName email' }
    ]);

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission
// @route   PUT /api/v1/submissions/:id/grade
// @access  Private (Teacher only)
const gradeSubmission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check if teacher owns the assignment's course
    const assignment = await Assignment.findById(submission.assignmentId._id).populate('courseId');
    if (assignment.courseId.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to grade this submission'
      });
    }

    // Validate grade is within assignment's total points
    if (grade > assignment.totalPoints || grade < 0) {
      return res.status(400).json({
        success: false,
        error: `Grade must be between 0 and ${assignment.totalPoints}`
      });
    }

    await submission.gradeSubmission(grade, feedback, req.user.id);

    // Populate fields for response
    await submission.populate([
      { path: 'assignmentId', select: 'title dueDate totalPoints' },
      { path: 'studentId', select: 'fullName email' },
      { path: 'gradedBy', select: 'fullName email' }
    ]);

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissions,
  getSubmission,
  createSubmission,
  gradeSubmission
};
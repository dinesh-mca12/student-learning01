import Course from '../models/Course.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { isActive: true };

  // Filter by teacher for teacher role
  if (req.user && req.user.role === 'teacher') {
    if (req.query.my === 'true') {
      query.teacher_id = req.user._id;
    }
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by level
  if (req.query.level) {
    query.level = req.query.level;
  }

  // Search by title or description
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { code: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter published courses for students
  if (!req.user || req.user.role === 'student') {
    query.isPublished = true;
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('teacher', 'full_name email avatar_url')
    .sort({ createdAt: -1 })
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
    count: courses.length,
    pagination,
    courses
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'full_name email avatar_url profile')
    .populate('assignments', 'title description due_date max_points');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if course is published for students
  if ((!req.user || req.user.role === 'student') && !course.isPublished) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.status(200).json({
    success: true,
    course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Teacher)
export const createCourse = asyncHandler(async (req, res) => {
  // Add teacher to req.body
  req.body.teacher_id = req.user.id;

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Teacher - Owner)
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Make sure user is course owner
  if (course.teacher_id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this course'
    });
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('teacher', 'full_name email avatar_url');

  res.status(200).json({
    success: true,
    course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Teacher - Owner)
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Make sure user is course owner
  if (course.teacher_id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to delete this course'
    });
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Add material to course
// @route   POST /api/courses/:id/materials
// @access  Private (Teacher - Owner)
export const addMaterial = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Make sure user is course owner
  if (course.teacher_id.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to add materials to this course'
    });
  }

  const material = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    url: req.body.url,
    size: req.body.size
  };

  course.materials.push(material);
  await course.save();

  res.status(200).json({
    success: true,
    course
  });
});

// @desc    Get course materials
// @route   GET /api/courses/:id/materials
// @access  Private (Enrolled students and course teacher)
export const getMaterials = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.status(200).json({
    success: true,
    materials: course.materials
  });
});

// @desc    Update course syllabus
// @route   PUT /api/courses/:id/syllabus
// @access  Private (Teacher - Owner)
export const updateSyllabus = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Make sure user is course owner
  if (course.teacher_id.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update syllabus for this course'
    });
  }

  course.syllabus = req.body.syllabus;
  await course.save();

  res.status(200).json({
    success: true,
    course
  });
});

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
export const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (!course.isPublished) {
    return res.status(400).json({
      success: false,
      message: 'Course is not available for enrollment'
    });
  }

  if (!course.enrollment.isOpen) {
    return res.status(400).json({
      success: false,
      message: 'Course enrollment is closed'
    });
  }

  if (course.isFull()) {
    return res.status(400).json({
      success: false,
      message: 'Course is full'
    });
  }

  // In a real app, you'd create an Enrollment record
  // For demo purposes, we'll just increment the count
  course.enrollment.currentStudents += 1;
  await course.save();

  res.status(200).json({
    success: true,
    message: 'Successfully enrolled in course',
    course
  });
});

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Teacher)
export const getCourseStats = asyncHandler(async (req, res) => {
  let query = {};
  
  // Filter by teacher if not admin
  if (req.user.role === 'teacher') {
    query.teacher_id = req.user._id;
  }

  const totalCourses = await Course.countDocuments(query);
  const publishedCourses = await Course.countDocuments({ ...query, isPublished: true });
  const activeCourses = await Course.countDocuments({ ...query, isActive: true });

  const categoryStats = await Course.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const levelStats = await Course.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      total: totalCourses,
      published: publishedCourses,
      active: activeCourses,
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      byLevel: levelStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    }
  });
});
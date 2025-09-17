import express from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  validateCreateCourse
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes (with optional auth for enrollment status)
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes
router.post('/', protect, authorize('teacher'), validateCreateCourse, createCourse);
router.put('/:id', protect, authorize('teacher'), updateCourse);
router.delete('/:id', protect, authorize('teacher'), deleteCourse);

// Enrollment routes (students only)
router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);
router.delete('/:id/enroll', protect, authorize('student'), unenrollFromCourse);

export default router;
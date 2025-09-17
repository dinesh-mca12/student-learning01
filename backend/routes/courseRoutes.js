import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
  getMaterials,
  updateSyllabus,
  enrollInCourse,
  getCourseStats
} from '../controllers/courseController.js';

import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes with optional auth
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes
router.use(protect);

// Student routes
router.post('/:id/enroll', authorize('student'), enrollInCourse);

// Teacher routes
router.post('/', authorize('teacher'), createCourse);
router.get('/stats/overview', authorize('teacher'), getCourseStats);
router.put('/:id', authorize('teacher'), updateCourse);
router.delete('/:id', authorize('teacher'), deleteCourse);
router.post('/:id/materials', authorize('teacher'), addMaterial);
router.get('/:id/materials', getMaterials);
router.put('/:id/syllabus', authorize('teacher'), updateSyllabus);

export default router;
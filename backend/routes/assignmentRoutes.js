import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  validateCreateAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();

// Protected routes - all assignment routes require authentication
router.get('/', protect, getAssignments);

// Teacher-only routes
router.post('/', protect, authorize('teacher'), validateCreateAssignment, createAssignment);
router.get('/:id/submissions', protect, authorize('teacher'), getAssignmentSubmissions);
router.put('/:id/submissions/:submissionId/grade', protect, authorize('teacher'), gradeSubmission);

// Student-only routes
router.post('/:id/submit', protect, authorize('student'), submitAssignment);

export default router;
import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getAssignmentStats
} from '../controllers/assignmentController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Common routes
router.get('/', getAssignments);
router.get('/stats', authorize('teacher'), getAssignmentStats);
router.get('/:id', getAssignment);

// Student routes
router.post('/:id/submit', authorize('student'), submitAssignment);

// Teacher routes
router.post('/', authorize('teacher'), createAssignment);
router.put('/:id', authorize('teacher'), updateAssignment);
router.delete('/:id', authorize('teacher'), deleteAssignment);
router.get('/:id/submissions', authorize('teacher'), getSubmissions);
router.put('/:id/submissions/:submissionId/grade', authorize('teacher'), gradeSubmission);

export default router;
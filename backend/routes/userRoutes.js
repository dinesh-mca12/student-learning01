import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';

import { protect, authorize, rateLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', rateLimit(15 * 60 * 1000, 5), register);
router.post('/login', rateLimit(15 * 60 * 1000, 5), login);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.get('/logout', logout);

// Teacher/Admin only routes
router.get('/', authorize('teacher'), getUsers);
router.get('/stats', authorize('teacher'), getUserStats);
router.get('/:id', getUser);

// Admin only routes (for this demo, we'll use teacher role)
router.put('/:id', authorize('teacher'), updateUser);
router.delete('/:id', authorize('teacher'), deleteUser);

export default router;
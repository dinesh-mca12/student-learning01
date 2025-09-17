import express from 'express';
import {
  getConversation,
  sendMessage,
  getMessages,
  addReaction,
  submitFeedback,
  getHistory,
  closeConversation,
  getAnalytics,
  updateContext
} from '../controllers/chatbotController.js';

import { protect, authorize, rateLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Conversation routes
router.get('/conversation', getConversation);
router.post('/message', rateLimit(60 * 1000, 20), sendMessage); // 20 messages per minute
router.get('/conversation/:id/messages', getMessages);
router.put('/conversation/:id/context', updateContext);
router.post('/conversation/:id/close', closeConversation);

// Interaction routes
router.post('/message/:messageId/reaction', addReaction);
router.post('/feedback', submitFeedback);

// History and analytics
router.get('/history', getHistory);
router.get('/analytics', authorize('teacher'), getAnalytics);

export default router;
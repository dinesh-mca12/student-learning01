import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler, sendSuccessResponse } from '../utils/helpers.js';
import ChatbotConversation from '../models/ChatbotConversation.js';

const router = express.Router();

/**
 * @desc    Ask chatbot a question
 * @route   POST /api/chatbot/ask
 * @access  Private
 */
const askChatbot = asyncHandler(async (req, res) => {
  const { question, sessionId } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Question is required'
    });
  }

  // Simple chatbot response logic (stub for AI integration)
  const answer = generateChatbotResponse(question);
  const category = categorizQuestion(question);

  // Save conversation
  const conversation = await ChatbotConversation.create({
    user: req.user._id,
    question: question.trim(),
    answer,
    category,
    sessionId: sessionId || null,
    confidence: 0.8
  });

  sendSuccessResponse(res, 200, 'Response generated successfully', {
    conversation: {
      id: conversation._id,
      question: conversation.question,
      answer: conversation.answer,
      category: conversation.category,
      createdAt: conversation.createdAt
    }
  });
});

/**
 * @desc    Get user's chatbot conversations
 * @route   GET /api/chatbot/conversations
 * @access  Private
 */
const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sessionId } = req.query;

  let query = { user: req.user._id };
  if (sessionId) {
    query.sessionId = sessionId;
  }

  const conversations = await ChatbotConversation.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ChatbotConversation.countDocuments(query);

  sendSuccessResponse(res, 200, 'Conversations retrieved successfully', {
    conversations,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: page * limit < total
    }
  });
});

// Simple chatbot response generator (stub for AI integration)
function generateChatbotResponse(question) {
  const lowerQuestion = question.toLowerCase();

  // Assignment related
  if (lowerQuestion.includes('assignment') || lowerQuestion.includes('submit')) {
    return "To submit an assignment, go to the Assignments page, find your assignment, and click 'Submit'. You can upload files or enter text depending on the assignment requirements. Make sure to submit before the due date!";
  }

  // Course related
  if (lowerQuestion.includes('course') || lowerQuestion.includes('class')) {
    return "You can access your courses from the Courses page. There you'll find all your enrolled courses, course materials, and announcements from your instructors.";
  }

  // Study tips
  if (lowerQuestion.includes('study') || lowerQuestion.includes('learn')) {
    return "Here are some effective study strategies:\n\n• Break study sessions into 25-50 minute chunks\n• Use active recall - test yourself frequently\n• Create a dedicated study space\n• Form study groups with classmates\n• Ask questions during live classes\n\nWhat specific subject are you studying? I can provide more targeted advice!";
  }

  // Technical issues
  if (lowerQuestion.includes('technical') || lowerQuestion.includes('problem') || lowerQuestion.includes('error')) {
    return "For technical issues, try these steps:\n\n1. Refresh the page\n2. Clear your browser cache\n3. Check your internet connection\n4. Try a different browser\n\nIf the problem persists, please contact your instructor or our technical support team.";
  }

  // Live classes
  if (lowerQuestion.includes('live') || lowerQuestion.includes('zoom') || lowerQuestion.includes('meeting')) {
    return "Live class links can be found on your Dashboard and in the specific course page. Make sure to join a few minutes early to test your audio and video. Don't forget to mute yourself when not speaking!";
  }

  // Teams and collaboration
  if (lowerQuestion.includes('team') || lowerQuestion.includes('group') || lowerQuestion.includes('collaborate')) {
    return "You can join teams and collaborate with classmates using our Teams feature. Create or join study groups, participate in discussions, and work together on projects. Check the Teams page to get started!";
  }

  // Default response
  return "That's an interesting question! While I can help with course-related topics, assignments, study strategies, and technical support, I might need a bit more context to give you the best answer.\n\nCould you please rephrase your question or let me know specifically what area you'd like help with? I'm here to make your learning experience better! 🌟";
}

// Categorize question for analytics
function categorizQuestion(question) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('assignment') || lowerQuestion.includes('submit')) {
    return 'assignment';
  }
  if (lowerQuestion.includes('course') || lowerQuestion.includes('class')) {
    return 'course';
  }
  if (lowerQuestion.includes('study') || lowerQuestion.includes('learn')) {
    return 'study_tips';
  }
  if (lowerQuestion.includes('technical') || lowerQuestion.includes('problem') || lowerQuestion.includes('error')) {
    return 'technical';
  }

  return 'general';
}

router.post('/ask', protect, askChatbot);
router.get('/conversations', protect, getConversations);

export default router;
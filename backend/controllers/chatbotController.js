import Chatbot from '../models/Chatbot.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// Simple AI response generator for demo purposes
const generateAIResponse = (userMessage, context) => {
  const message = userMessage.toLowerCase();
  
  // Common responses based on keywords
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! I'm your AI learning assistant. How can I help you today?";
  }
  
  if (message.includes('assignment') || message.includes('homework')) {
    return "I can help you with assignments! You can:\n• View your current assignments\n• Get tips on how to approach them\n• Learn about submission deadlines\n• Ask for clarification on requirements\n\nWhat specific assignment question do you have?";
  }
  
  if (message.includes('course') || message.includes('class')) {
    return "I can help you with course-related questions:\n• Browse available courses\n• Get information about course content\n• Learn about prerequisites\n• Find course materials\n\nWhat would you like to know about your courses?";
  }
  
  if (message.includes('team') || message.includes('group')) {
    return "Teams are a great way to collaborate! I can help you:\n• Create or join teams\n• Manage team projects\n• Organize team tasks\n• Communicate with teammates\n\nWhat team-related help do you need?";
  }
  
  if (message.includes('study') || message.includes('learn')) {
    return "Here are some effective study strategies:\n• Break material into smaller chunks\n• Use active recall techniques\n• Create a study schedule\n• Form study groups\n• Take regular breaks\n• Practice spaced repetition\n\nWould you like specific tips for any subject?";
  }
  
  if (message.includes('grade') || message.includes('score')) {
    return "I can help you understand grading:\n• Check your current grades\n• Understand grading rubrics\n• Calculate your overall performance\n• Get tips to improve your scores\n\nWhat specific grading question do you have?";
  }
  
  if (message.includes('help') || message.includes('support')) {
    return "I'm here to help! I can assist you with:\n• Course navigation and content\n• Assignment guidance and tips\n• Study strategies and techniques\n• Team collaboration\n• Technical platform support\n• General academic advice\n\nPlease tell me more about what you need help with!";
  }
  
  if (message.includes('technical') || message.includes('bug') || message.includes('error')) {
    return "I can help with technical issues:\n• Login problems\n• File upload issues\n• Platform navigation\n• Browser compatibility\n• Mobile app problems\n\nIf you're experiencing a specific technical issue, please describe what's happening and I'll provide troubleshooting steps.";
  }
  
  // Default response
  return "I understand you're asking about: " + message + "\n\nI'm here to help with your learning journey! I can assist with courses, assignments, study tips, team collaboration, and technical support. Could you please provide more specific details about what you'd like help with?";
};

// @desc    Get or create conversation
// @route   GET /api/chatbot/conversation
// @access  Private
export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Chatbot.getOrCreateConversation(req.user._id);
  
  res.status(200).json({
    success: true,
    conversation
  });
});

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, conversationId } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  let conversation;
  
  if (conversationId) {
    conversation = await Chatbot.findOne({
      conversation_id: conversationId,
      user_id: req.user._id
    });
  }
  
  if (!conversation) {
    conversation = await Chatbot.getOrCreateConversation(req.user._id);
  }

  // Add user message
  const userMessage = {
    id: `msg_${Date.now()}_user`,
    type: 'user',
    content: content.trim(),
    timestamp: new Date(),
    metadata: {
      intent: 'user_query',
      confidence: 1.0
    }
  };

  await conversation.addMessage(userMessage);

  // Generate AI response
  const responseStartTime = Date.now();
  const aiContent = generateAIResponse(content, conversation.context);
  const responseTime = Date.now() - responseStartTime;

  // Add bot response
  const botMessage = {
    id: `msg_${Date.now()}_bot`,
    type: 'bot',
    content: aiContent,
    timestamp: new Date(),
    metadata: {
      intent: 'ai_response',
      confidence: 0.9,
      responseTime: responseTime,
      context: {
        userRole: req.user.role,
        messageCount: conversation.messages.length
      }
    }
  };

  await conversation.addMessage(botMessage);

  // Update context with user information
  await conversation.updateContext({
    userRole: req.user.role,
    lastInteraction: new Date()
  });

  res.status(200).json({
    success: true,
    conversation: {
      id: conversation.conversation_id,
      messages: conversation.getRecentMessages(10)
    }
  });
});

// @desc    Get conversation messages
// @route   GET /api/chatbot/conversation/:id/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const conversation = await Chatbot.findOne({
    conversation_id: id,
    user_id: req.user._id
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  const messages = conversation.messages
    .slice(offset, offset + limit)
    .reverse(); // Show latest messages first

  res.status(200).json({
    success: true,
    messages,
    total: conversation.messages.length
  });
});

// @desc    Add reaction to message
// @route   POST /api/chatbot/message/:messageId/reaction
// @access  Private
export const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { type } = req.body;

  if (!['like', 'dislike', 'helpful', 'not_helpful'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reaction type'
    });
  }

  const conversation = await Chatbot.findOne({
    user_id: req.user._id,
    'messages.id': messageId
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  await conversation.addReaction(messageId, type);

  res.status(200).json({
    success: true,
    message: 'Reaction added successfully'
  });
});

// @desc    Submit feedback
// @route   POST /api/chatbot/feedback
// @access  Private
export const submitFeedback = asyncHandler(async (req, res) => {
  const { type, content, rating, conversationId } = req.body;

  let conversation;
  
  if (conversationId) {
    conversation = await Chatbot.findOne({
      conversation_id: conversationId,
      user_id: req.user._id
    });
  } else {
    conversation = await Chatbot.findOne({
      user_id: req.user._id,
      status: { $in: ['active', 'idle'] }
    }).sort({ lastActivity: -1 });
  }

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'No active conversation found'
    });
  }

  const feedback = {
    type,
    content,
    rating,
    timestamp: new Date()
  };

  await conversation.addFeedback(feedback);

  res.status(200).json({
    success: true,
    message: 'Feedback submitted successfully'
  });
});

// @desc    Get conversation history
// @route   GET /api/chatbot/history
// @access  Private
export const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const conversations = await Chatbot.find({
    user_id: req.user._id
  })
    .select('conversation_id status lastActivity analytics.totalMessages analytics.sessionDuration')
    .sort({ lastActivity: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Chatbot.countDocuments({ user_id: req.user._id });

  res.status(200).json({
    success: true,
    conversations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Close conversation
// @route   POST /api/chatbot/conversation/:id/close
// @access  Private
export const closeConversation = asyncHandler(async (req, res) => {
  const conversation = await Chatbot.findOne({
    conversation_id: req.params.id,
    user_id: req.user._id
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  await conversation.closeConversation();

  res.status(200).json({
    success: true,
    message: 'Conversation closed successfully'
  });
});

// @desc    Get chatbot analytics (Teacher only)
// @route   GET /api/chatbot/analytics
// @access  Private (Teacher)
export const getAnalytics = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teachers only.'
    });
  }

  const totalConversations = await Chatbot.countDocuments({});
  const activeConversations = await Chatbot.countDocuments({ status: 'active' });
  
  const totalMessages = await Chatbot.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$analytics.totalMessages' }
      }
    }
  ]);

  const averageSession = await Chatbot.aggregate([
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$analytics.sessionDuration' }
      }
    }
  ]);

  const topIntents = await Chatbot.aggregate([
    { $unwind: '$analytics.commonIntents' },
    {
      $group: {
        _id: '$analytics.commonIntents.intent',
        count: { $sum: '$analytics.commonIntents.count' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const satisfactionRating = await Chatbot.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$analytics.satisfactionRating' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalConversations,
      activeConversations,
      totalMessages: totalMessages[0]?.total || 0,
      averageSessionDuration: averageSession[0]?.avgDuration || 0,
      averageSatisfaction: satisfactionRating[0]?.avgRating || 0,
      topIntents: topIntents.map(intent => ({
        intent: intent._id,
        count: intent.count
      }))
    }
  });
});

// @desc    Update conversation context
// @route   PUT /api/chatbot/conversation/:id/context
// @access  Private
export const updateContext = asyncHandler(async (req, res) => {
  const conversation = await Chatbot.findOne({
    conversation_id: req.params.id,
    user_id: req.user._id
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  await conversation.updateContext(req.body);

  res.status(200).json({
    success: true,
    message: 'Context updated successfully',
    context: conversation.context
  });
});
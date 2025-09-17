import mongoose from 'mongoose';

const chatbotSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  conversation_id: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Message content cannot exceed 5000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intent: String,
      confidence: Number,
      entities: [mongoose.Schema.Types.Mixed],
      context: mongoose.Schema.Types.Mixed,
      responseTime: Number
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'file', 'link']
      },
      url: String,
      name: String,
      size: Number
    }],
    reactions: [{
      type: {
        type: String,
        enum: ['like', 'dislike', 'helpful', 'not_helpful']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  context: {
    currentCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    currentAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    currentTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    userRole: {
      type: String,
      enum: ['student', 'teacher']
    },
    sessionData: mongoose.Schema.Types.Mixed,
    preferences: {
      language: {
        type: String,
        default: 'en'
      },
      responseStyle: {
        type: String,
        enum: ['formal', 'casual', 'detailed', 'brief'],
        default: 'casual'
      },
      topics: [String]
    }
  },
  analytics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    botMessages: {
      type: Number,
      default: 0
    },
    sessionDuration: {
      type: Number,
      default: 0 // in minutes
    },
    commonIntents: [{
      intent: String,
      count: Number
    }],
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    resolvedQueries: {
      type: Number,
      default: 0
    },
    escalatedQueries: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'closed'],
    default: 'active'
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    maxMessageHistory: {
      type: Number,
      default: 100
    }
  },
  feedback: [{
    type: {
      type: String,
      enum: ['rating', 'comment', 'bug_report', 'feature_request']
    },
    content: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
chatbotSchema.index({ user_id: 1 });
chatbotSchema.index({ conversation_id: 1 });
chatbotSchema.index({ status: 1 });
chatbotSchema.index({ lastActivity: 1 });
chatbotSchema.index({ 'messages.timestamp': 1 });

// Virtual for user details
chatbotSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Method to add message
chatbotSchema.methods.addMessage = function(messageData) {
  const message = {
    id: messageData.id || new mongoose.Types.ObjectId().toString(),
    type: messageData.type,
    content: messageData.content,
    timestamp: messageData.timestamp || new Date(),
    metadata: messageData.metadata || {},
    attachments: messageData.attachments || [],
    reactions: []
  };
  
  this.messages.push(message);
  
  // Update analytics
  this.analytics.totalMessages += 1;
  if (messageData.type === 'user') {
    this.analytics.userMessages += 1;
  } else {
    this.analytics.botMessages += 1;
  }
  
  // Update intent tracking
  if (messageData.metadata && messageData.metadata.intent) {
    const intentIndex = this.analytics.commonIntents.findIndex(
      item => item.intent === messageData.metadata.intent
    );
    if (intentIndex > -1) {
      this.analytics.commonIntents[intentIndex].count += 1;
    } else {
      this.analytics.commonIntents.push({
        intent: messageData.metadata.intent,
        count: 1
      });
    }
  }
  
  // Limit message history
  if (this.messages.length > this.settings.maxMessageHistory) {
    this.messages = this.messages.slice(-this.settings.maxMessageHistory);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Method to add reaction to message
chatbotSchema.methods.addReaction = function(messageId, reactionType) {
  const message = this.messages.id(messageId);
  if (message) {
    message.reactions.push({
      type: reactionType,
      timestamp: new Date()
    });
    return this.save();
  }
  throw new Error('Message not found');
};

// Method to update context
chatbotSchema.methods.updateContext = function(contextData) {
  this.context = { ...this.context, ...contextData };
  return this.save();
};

// Method to add feedback
chatbotSchema.methods.addFeedback = function(feedbackData) {
  this.feedback.push(feedbackData);
  
  if (feedbackData.type === 'rating' && feedbackData.rating) {
    // Update satisfaction rating (simple average)
    const ratings = this.feedback
      .filter(f => f.type === 'rating' && f.rating)
      .map(f => f.rating);
    
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    this.analytics.satisfactionRating = sum / ratings.length;
  }
  
  return this.save();
};

// Method to get recent messages
chatbotSchema.methods.getRecentMessages = function(limit = 20) {
  return this.messages.slice(-limit);
};

// Method to calculate session duration
chatbotSchema.methods.calculateSessionDuration = function() {
  if (this.messages.length < 2) return 0;
  
  const firstMessage = this.messages[0];
  const lastMessage = this.messages[this.messages.length - 1];
  const duration = (lastMessage.timestamp - firstMessage.timestamp) / (1000 * 60); // in minutes
  
  this.analytics.sessionDuration = duration;
  return this.save({ validateBeforeSave: false });
};

// Method to close conversation
chatbotSchema.methods.closeConversation = function() {
  this.status = 'closed';
  this.calculateSessionDuration();
  return this.save();
};

// Static method to create new conversation
chatbotSchema.statics.createConversation = function(userId) {
  const conversationId = `conv_${userId}_${Date.now()}`;
  return this.create({
    user_id: userId,
    conversation_id: conversationId,
    messages: [],
    context: {}
  });
};

// Static method to get or create conversation
chatbotSchema.statics.getOrCreateConversation = async function(userId) {
  let conversation = await this.findOne({
    user_id: userId,
    status: { $in: ['active', 'idle'] }
  }).sort({ lastActivity: -1 });
  
  if (!conversation) {
    conversation = await this.createConversation(userId);
  }
  
  return conversation;
};

const Chatbot = mongoose.model('Chatbot', chatbotSchema);

export default Chatbot;
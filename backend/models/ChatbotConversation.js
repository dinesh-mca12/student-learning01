import mongoose from 'mongoose';

const chatbotConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    maxlength: [1000, 'Question cannot exceed 1000 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    maxlength: [5000, 'Answer cannot exceed 5000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'course', 'assignment', 'technical', 'study_tips'],
    default: 'general'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters'],
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  sessionId: {
    type: String,
    default: null // For grouping related conversations
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
chatbotConversationSchema.index({ user: 1, createdAt: -1 });
chatbotConversationSchema.index({ category: 1 });
chatbotConversationSchema.index({ sessionId: 1 });

export default mongoose.model('ChatbotConversation', chatbotConversationSchema);
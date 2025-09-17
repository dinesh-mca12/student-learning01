import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    maxlength: [100, 'Channel name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Channel description cannot exceed 500 characters']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Channel creator is required']
  },
  type: {
    type: String,
    enum: ['general', 'assignment', 'announcement', 'discussion'],
    default: 'general'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
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
channelSchema.index({ team: 1 });
channelSchema.index({ creator: 1 });
channelSchema.index({ isActive: 1 });

// Virtual for message count
channelSchema.virtual('messageCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'channel',
  count: true
});

// Ensure virtual fields are serialized
channelSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Channel', channelSchema);
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Team description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null // null for general teams not tied to a specific course
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Team creator is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: null, // null means no limit
    min: [2, 'Team must allow at least 2 members']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
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
teamSchema.index({ course: 1 });
teamSchema.index({ creator: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isActive: 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Ensure virtual fields are serialized
teamSchema.set('toJSON', { virtuals: true });

// Add creator as admin member when team is created
teamSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({
      user: this.creator,
      role: 'admin',
      joinedAt: new Date()
    });
  }
  next();
});

export default mongoose.model('Team', teamSchema);
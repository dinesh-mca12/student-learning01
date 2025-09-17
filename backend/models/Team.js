import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  members: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member', 'observer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: true
      },
      canInvite: {
        type: Boolean,
        default: false
      },
      canRemove: {
        type: Boolean,
        default: false
      }
    }
  }],
  settings: {
    maxMembers: {
      type: Number,
      min: 2,
      max: 20,
      default: 6
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    allowSelfJoin: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  channels: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    type: {
      type: String,
      enum: ['general', 'announcement', 'discussion', 'project'],
      default: 'general'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'review', 'completed', 'on-hold'],
      default: 'planning'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: Date,
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    tasks: [{
      title: String,
      description: String,
      status: {
        type: String,
        enum: ['todo', 'in-progress', 'completed'],
        default: 'todo'
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dueDate: Date,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    files: [{
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  invitations: [{
    email: {
      type: String,
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending'
    },
    token: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  activity: [{
    type: {
      type: String,
      enum: ['member_joined', 'member_left', 'project_created', 'task_completed', 'file_uploaded', 'announcement'],
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalProjects: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    }
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
teamSchema.index({ course_id: 1 });
teamSchema.index({ created_by: 1 });
teamSchema.index({ 'members.user_id': 1 });
teamSchema.index({ isActive: 1 });

// Virtual for course details
teamSchema.virtual('course', {
  ref: 'Course',
  localField: 'course_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator details
teamSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Team is full');
  }
  
  const existingMember = this.members.find(m => m.user_id.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member');
  }
  
  this.members.push({
    user_id: userId,
    role: role,
    permissions: {
      canEdit: role === 'leader',
      canInvite: role === 'leader',
      canRemove: role === 'leader'
    }
  });
  
  this.activity.push({
    type: 'member_joined',
    user_id: userId,
    description: `New member joined the team`
  });
  
  return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user_id.toString() !== userId.toString());
  
  this.activity.push({
    type: 'member_left',
    user_id: userId,
    description: `Member left the team`
  });
  
  return this.save();
};

// Method to check if user is member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user_id.toString() === userId.toString() && m.isActive);
};

// Method to get member role
teamSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(m => m.user_id.toString() === userId.toString());
  return member ? member.role : null;
};

// Method to update statistics
teamSchema.methods.updateStats = function() {
  this.stats.totalProjects = this.projects.length;
  this.stats.completedProjects = this.projects.filter(p => p.status === 'completed').length;
  this.stats.totalTasks = this.projects.reduce((total, project) => total + project.tasks.length, 0);
  this.stats.completedTasks = this.projects.reduce((total, project) => 
    total + project.tasks.filter(task => task.status === 'completed').length, 0);
  
  return this.save({ validateBeforeSave: false });
};

const Team = mongoose.model('Team', teamSchema);

export default Team;
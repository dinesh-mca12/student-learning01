import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  instructions: {
    type: String,
    maxlength: [10000, 'Instructions cannot be more than 10000 characters']
  },
  type: {
    type: String,
    enum: ['homework', 'quiz', 'project', 'exam', 'discussion', 'lab'],
    default: 'homework'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  max_points: {
    type: Number,
    required: [true, 'Maximum points is required'],
    min: [1, 'Maximum points must be at least 1'],
    max: [1000, 'Maximum points cannot exceed 1000']
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  submission: {
    allowedFileTypes: [{
      type: String,
      enum: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'zip', 'mp4', 'mp3']
    }],
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    allowMultipleFiles: {
      type: Boolean,
      default: true
    },
    allowLateSubmission: {
      type: Boolean,
      default: true
    },
    latePenaltyPerDay: {
      type: Number,
      min: 0,
      max: 100,
      default: 10
    }
  },
  grading: {
    rubric: [{
      criteria: String,
      description: String,
      maxPoints: Number,
      weight: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    autoGrade: {
      type: Boolean,
      default: false
    },
    passingGrade: {
      type: Number,
      min: 0,
      max: 100,
      default: 60
    },
    showGradeImmediately: {
      type: Boolean,
      default: false
    }
  },
  resources: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'example']
    },
    url: String,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  questions: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'coding']
    },
    question: String,
    options: [String], // For multiple choice
    correctAnswer: String,
    points: Number,
    explanation: String
  }],
  settings: {
    isVisible: {
      type: Boolean,
      default: true
    },
    allowGroupSubmission: {
      type: Boolean,
      default: false
    },
    maxGroupSize: {
      type: Number,
      min: 2,
      max: 10,
      default: 2
    },
    requireTextSubmission: {
      type: Boolean,
      default: true
    },
    requireFileSubmission: {
      type: Boolean,
      default: false
    },
    plagiarismCheck: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    submissionCount: {
      type: Number,
      default: 0
    },
    averageGrade: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
assignmentSchema.index({ course_id: 1 });
assignmentSchema.index({ due_date: 1 });
assignmentSchema.index({ isActive: 1, isPublished: 1 });
assignmentSchema.index({ type: 1 });

// Virtual for course details
assignmentSchema.virtual('course', {
  ref: 'Course',
  localField: 'course_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for submissions
assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment_id'
});

// Method to check if assignment is overdue
assignmentSchema.methods.isOverdue = function() {
  return new Date() > this.due_date;
};

// Method to check if assignment is open for submission
assignmentSchema.methods.isOpen = function() {
  const now = new Date();
  return now >= this.start_date && (now <= this.due_date || this.submission.allowLateSubmission);
};

// Method to calculate late penalty
assignmentSchema.methods.calculateLatePenalty = function(submissionDate) {
  if (submissionDate <= this.due_date) return 0;
  
  const daysLate = Math.ceil((submissionDate - this.due_date) / (1000 * 60 * 60 * 24));
  return Math.min(daysLate * this.submission.latePenaltyPerDay, 100);
};

// Method to update analytics
assignmentSchema.methods.updateAnalytics = async function() {
  const Submission = mongoose.model('Submission');
  const submissions = await Submission.find({ assignment_id: this._id });
  
  this.analytics.submissionCount = submissions.length;
  
  if (submissions.length > 0) {
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
    if (gradedSubmissions.length > 0) {
      const totalGrade = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0);
      this.analytics.averageGrade = totalGrade / gradedSubmissions.length;
    }
    
    // Calculate completion rate based on course enrollment
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course_id);
    if (course) {
      this.analytics.completionRate = (submissions.length / course.enrollment.currentStudents) * 100;
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
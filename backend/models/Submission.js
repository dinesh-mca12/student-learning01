import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  content: {
    type: String,
    maxlength: [10000, 'Submission content cannot exceed 10000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'submitted'
  },
  grade: {
    type: Number,
    min: 0,
    default: null
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isLate: {
    type: Boolean,
    default: false
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

// Compound index to ensure one submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1 });
submissionSchema.index({ status: 1 });

// Pre-save middleware to check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const assignment = await mongoose.model('Assignment').findById(this.assignment);
      if (assignment && assignment.dueDate) {
        this.isLate = new Date() > assignment.dueDate;
      }
    } catch (error) {
      console.error('Error checking late submission:', error);
    }
  }
  next();
});

export default mongoose.model('Submission', submissionSchema);
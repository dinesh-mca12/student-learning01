const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  content: {
    type: String,
    required: [true, 'Submission content is required'],
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'pending'
  },
  grade: {
    type: Number,
    min: [0, 'Grade cannot be negative'],
    default: null
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot be more than 2000 characters'],
    default: null
  },
  submittedAt: {
    type: Date,
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
  }
}, {
  timestamps: true
});

// Compound index to ensure one submission per student per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// Index for better query performance
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: 1 });

// Virtual to check if submission is late
submissionSchema.virtual('isLate').get(function() {
  if (!this.submittedAt) return false;
  return this.populated('assignmentId') && 
         this.submittedAt > this.assignmentId.dueDate;
});

// Virtual to get grade percentage
submissionSchema.virtual('gradePercentage').get(function() {
  if (!this.grade || !this.populated('assignmentId')) return null;
  return (this.grade / this.assignmentId.totalPoints) * 100;
});

// Method to submit
submissionSchema.methods.submit = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

// Method to grade submission
submissionSchema.methods.gradeSubmission = function(grade, feedback, gradedBy) {
  this.grade = grade;
  this.feedback = feedback;
  this.gradedBy = gradedBy;
  this.gradedAt = new Date();
  this.status = 'graded';
  return this.save();
};

// Static method to find submissions by assignment
submissionSchema.statics.findByAssignment = function(assignmentId) {
  return this.find({ assignmentId })
    .populate('studentId', 'fullName email')
    .populate('gradedBy', 'fullName email');
};

// Static method to find submissions by student
submissionSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId })
    .populate('assignmentId', 'title dueDate totalPoints')
    .populate('gradedBy', 'fullName email');
};

module.exports = mongoose.model('Submission', submissionSchema);
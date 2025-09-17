const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  instructions: {
    type: String,
    maxlength: [3000, 'Instructions cannot be more than 3000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  totalPoints: {
    type: Number,
    default: 100,
    min: [1, 'Total points must be at least 1'],
    max: [1000, 'Total points cannot exceed 1000']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }]
}, {
  timestamps: true
});

// Index for better query performance
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

// Virtual to check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'closed';
});

// Virtual to get days until due
assignmentSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const timeDiff = this.dueDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Method to publish assignment
assignmentSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

// Method to close assignment
assignmentSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

// Static method to find assignments by course
assignmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId }).populate('createdBy', 'fullName email');
};

// Static method to find published assignments
assignmentSchema.statics.findPublished = function() {
  return this.find({ status: 'published' });
};

module.exports = mongoose.model('Assignment', assignmentSchema);
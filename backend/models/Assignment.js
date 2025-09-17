import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Assignment title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [5000, 'Assignment description cannot exceed 5000 characters']
  },
  instructions: {
    type: String,
    maxlength: [10000, 'Instructions cannot exceed 10000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 100,
    min: [1, 'Total points must be at least 1'],
    max: [1000, 'Total points cannot exceed 1000']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  allowLateSubmissions: {
    type: Boolean,
    default: false
  },
  submissionTypes: [{
    type: String,
    enum: ['text', 'file', 'url', 'media'],
    default: ['text']
  }],
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }]
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
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

// Virtual for submission count
assignmentSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment',
  count: true
});

// Ensure virtual fields are serialized
assignmentSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Assignment', assignmentSchema);
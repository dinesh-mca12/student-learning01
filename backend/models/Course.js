import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Course code must be 3-10 alphanumeric characters']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course teacher is required']
  },
  coverImageUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentLimit: {
    type: Number,
    default: null, // null means no limit
    min: [1, 'Enrollment limit must be at least 1']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
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

// Indexes for efficient queries
courseSchema.index({ teacher: 1 });
courseSchema.index({ code: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount', {
  ref: 'CourseEnrollment',
  localField: '_id',
  foreignField: 'course',
  count: true
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Course', courseSchema);
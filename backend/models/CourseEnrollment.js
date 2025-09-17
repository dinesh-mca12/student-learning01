import mongoose from 'mongoose';

const courseEnrollmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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

// Compound index to ensure one enrollment per student per course
courseEnrollmentSchema.index({ course: 1, student: 1 }, { unique: true });
courseEnrollmentSchema.index({ student: 1 });
courseEnrollmentSchema.index({ course: 1 });

export default mongoose.model('CourseEnrollment', courseEnrollmentSchema);
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001']
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  category: {
    type: String,
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'Arts', 'Other'],
    default: 'Other'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    weeks: {
      type: Number,
      min: 1,
      max: 52,
      default: 12
    },
    hoursPerWeek: {
      type: Number,
      min: 1,
      max: 40,
      default: 3
    }
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: String,
    endTime: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  enrollment: {
    maxStudents: {
      type: Number,
      min: 1,
      max: 1000,
      default: 30
    },
    currentStudents: {
      type: Number,
      default: 0
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    startDate: Date,
    endDate: Date
  },
  materials: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'image', 'link']
    },
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  syllabus: [{
    week: Number,
    topic: String,
    description: String,
    readings: [String],
    assignments: [String]
  }],
  grading: {
    assignments: {
      type: Number,
      min: 0,
      max: 100,
      default: 40
    },
    participation: {
      type: Number,
      min: 0,
      max: 100,
      default: 20
    },
    projects: {
      type: Number,
      min: 0,
      max: 100,
      default: 40
    }
  },
  settings: {
    allowLateSubmissions: {
      type: Boolean,
      default: true
    },
    latePenalty: {
      type: Number,
      min: 0,
      max: 100,
      default: 10
    },
    autoGrading: {
      type: Boolean,
      default: false
    },
    discussionEnabled: {
      type: Boolean,
      default: true
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
courseSchema.index({ teacher_id: 1 });
courseSchema.index({ code: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isActive: 1, isPublished: 1 });

// Virtual for assignments
courseSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'course_id'
});

// Virtual for enrollments
courseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course_id'
});

// Virtual for teacher details
courseSchema.virtual('teacher', {
  ref: 'User',
  localField: 'teacher_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate teacher role
courseSchema.pre('save', async function(next) {
  if (this.isModified('teacher_id')) {
    const User = mongoose.model('User');
    const teacher = await User.findById(this.teacher_id);
    if (!teacher || teacher.role !== 'teacher') {
      return next(new Error('Invalid teacher ID or user is not a teacher'));
    }
  }
  next();
});

// Method to check if course is full
courseSchema.methods.isFull = function() {
  return this.enrollment.currentStudents >= this.enrollment.maxStudents;
};

// Method to add material
courseSchema.methods.addMaterial = function(material) {
  this.materials.push(material);
  return this.save();
};

// Method to update enrollment count
courseSchema.methods.updateEnrollmentCount = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const count = await Enrollment.countDocuments({ course_id: this._id, isActive: true });
  this.enrollment.currentStudents = count;
  return this.save({ validateBeforeSave: false });
};

const Course = mongoose.model('Course', courseSchema);

export default Course;
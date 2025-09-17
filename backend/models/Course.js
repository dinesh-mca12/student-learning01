const mongoose = require('mongoose');

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
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9]{6,10}$/, 'Course code must be 6-10 characters long and contain only letters and numbers']
  },
  coverImageUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxStudents: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

// Index for better query performance
courseSchema.index({ teacherId: 1 });
courseSchema.index({ courseCode: 1 });
courseSchema.index({ title: 'text', description: 'text' });

// Virtual for enrolled students count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents.length;
});

// Method to check if course is full
courseSchema.methods.isFull = function() {
  return this.enrolledStudents.length >= this.maxStudents;
};

// Method to enroll a student
courseSchema.methods.enrollStudent = function(studentId) {
  if (!this.isFull() && !this.enrolledStudents.includes(studentId)) {
    this.enrolledStudents.push(studentId);
    return this.save();
  }
  throw new Error('Cannot enroll student: course is full or student already enrolled');
};

// Method to unenroll a student
courseSchema.methods.unenrollStudent = function(studentId) {
  this.enrolledStudents = this.enrolledStudents.filter(
    id => id.toString() !== studentId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);
const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse
} = require('../controllers/courseController');
const { auth, requireTeacher, requireStudent } = require('../middleware/auth');
const {
  createCourseValidation,
  updateCourseValidation
} = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(getCourses)
  .post(auth, requireTeacher, createCourseValidation, createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(auth, requireTeacher, updateCourseValidation, updateCourse)
  .delete(auth, requireTeacher, deleteCourse);

router
  .route('/:id/enroll')
  .post(auth, requireStudent, enrollInCourse)
  .delete(auth, requireStudent, unenrollFromCourse);

module.exports = router;
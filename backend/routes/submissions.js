const express = require('express');
const {
  getSubmissions,
  getSubmission,
  createSubmission,
  gradeSubmission
} = require('../controllers/submissionController');
const { auth, requireTeacher, requireStudent } = require('../middleware/auth');
const {
  createSubmissionValidation,
  gradeSubmissionValidation
} = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(auth, getSubmissions)
  .post(auth, requireStudent, createSubmissionValidation, createSubmission);

router
  .route('/:id')
  .get(auth, getSubmission);

router
  .route('/:id/grade')
  .put(auth, requireTeacher, gradeSubmissionValidation, gradeSubmission);

module.exports = router;
const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { auth, requireTeacher } = require('../middleware/auth');
const {
  createAssignmentValidation,
  updateAssignmentValidation
} = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(auth, getAssignments)
  .post(auth, requireTeacher, createAssignmentValidation, createAssignment);

router
  .route('/:id')
  .get(auth, getAssignment)
  .put(auth, requireTeacher, updateAssignmentValidation, updateAssignment)
  .delete(auth, requireTeacher, deleteAssignment);

module.exports = router;
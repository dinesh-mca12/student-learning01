import express from 'express';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  addProject,
  addTask,
  updateTaskStatus,
  getTeamStats
} from '../controllers/teamController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Team routes
router.get('/', getTeams);
router.post('/', createTeam);
router.get('/stats', getTeamStats);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team membership
router.post('/:id/join', joinTeam);
router.post('/:id/leave', leaveTeam);

// Project management
router.post('/:id/projects', addProject);
router.post('/:id/projects/:projectId/tasks', addTask);
router.put('/:id/projects/:projectId/tasks/:taskId', updateTaskStatus);

export default router;
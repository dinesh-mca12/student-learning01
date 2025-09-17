import Team from '../models/Team.js';
import Course from '../models/Course.js';
import { asyncHandler } from '../middleware/authMiddleware.js';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getTeams = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { isActive: true };

  // Filter by course
  if (req.query.courseId) {
    query.course_id = req.query.courseId;
  }

  // Filter by user's teams
  if (req.query.my === 'true') {
    query.$or = [
      { created_by: req.user._id },
      { 'members.user_id': req.user._id }
    ];
  }

  // Search
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await Team.countDocuments(query);
  const teams = await Team.find(query)
    .populate('course', 'title code')
    .populate('created_by', 'full_name email avatar_url')
    .populate('members.user_id', 'full_name email avatar_url')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  res.status(200).json({
    success: true,
    count: teams.length,
    pagination,
    teams
  });
});

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('course', 'title code teacher_id')
    .populate('created_by', 'full_name email avatar_url')
    .populate('members.user_id', 'full_name email avatar_url')
    .populate('projects.assignedTo', 'full_name email')
    .populate('projects.tasks.assignedTo', 'full_name email');

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is member or teacher of the course
  const isMember = team.isMember(req.user._id);
  const isTeacher = req.user.role === 'teacher' && team.course.teacher_id.toString() === req.user._id.toString();

  if (!isMember && !isTeacher) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this team'
    });
  }

  res.status(200).json({
    success: true,
    team
  });
});

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
export const createTeam = asyncHandler(async (req, res) => {
  // Check if course exists
  const course = await Course.findById(req.body.course_id);
  
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Add creator to req.body
  req.body.created_by = req.user._id;

  const team = await Team.create(req.body);

  // Add creator as team leader
  await team.addMember(req.user._id, 'leader');

  // Create default channels
  team.channels.push({
    name: 'general',
    description: 'General team discussion',
    type: 'general'
  });

  team.channels.push({
    name: 'announcements',
    description: 'Team announcements',
    type: 'announcement'
  });

  await team.save();

  const populatedTeam = await Team.findById(team._id)
    .populate('course', 'title code')
    .populate('created_by', 'full_name email avatar_url')
    .populate('members.user_id', 'full_name email avatar_url');

  res.status(201).json({
    success: true,
    team: populatedTeam
  });
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Team Leader or Teacher)
export const updateTeam = asyncHandler(async (req, res) => {
  let team = await Team.findById(req.params.id).populate('course');

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check authorization
  const userRole = team.getMemberRole(req.user._id);
  const isTeacher = req.user.role === 'teacher' && team.course.teacher_id.toString() === req.user._id.toString();

  if (userRole !== 'leader' && !isTeacher) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this team'
    });
  }

  team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('course', 'title code')
    .populate('created_by', 'full_name email avatar_url')
    .populate('members.user_id', 'full_name email avatar_url');

  res.status(200).json({
    success: true,
    team
  });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Team Creator or Teacher)
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('course');

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check authorization
  const isCreator = team.created_by.toString() === req.user._id.toString();
  const isTeacher = req.user.role === 'teacher' && team.course.teacher_id.toString() === req.user._id.toString();

  if (!isCreator && !isTeacher) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this team'
    });
  }

  await team.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Team deleted successfully'
  });
});

// @desc    Join team
// @route   POST /api/teams/:id/join
// @access  Private (Student)
export const joinTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (!team.settings.allowSelfJoin && !team.settings.isPublic) {
    return res.status(400).json({
      success: false,
      message: 'Team does not allow self-joining'
    });
  }

  try {
    await team.addMember(req.user._id);
    
    const populatedTeam = await Team.findById(team._id)
      .populate('members.user_id', 'full_name email avatar_url');

    res.status(200).json({
      success: true,
      message: 'Successfully joined team',
      team: populatedTeam
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
export const leaveTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (!team.isMember(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this team'
    });
  }

  await team.removeMember(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Successfully left team'
  });
});

// @desc    Add project to team
// @route   POST /api/teams/:id/projects
// @access  Private (Team Member)
export const addProject = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (!team.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add projects to this team'
    });
  }

  const project = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'planning',
    priority: req.body.priority || 'medium',
    dueDate: req.body.dueDate,
    assignedTo: req.body.assignedTo || [],
    tasks: []
  };

  team.projects.push(project);
  await team.updateStats();

  team.activity.push({
    type: 'project_created',
    user_id: req.user._id,
    description: `Created project: ${project.title}`
  });

  await team.save();

  res.status(200).json({
    success: true,
    team
  });
});

// @desc    Add task to project
// @route   POST /api/teams/:id/projects/:projectId/tasks
// @access  Private (Team Member)
export const addTask = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (!team.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add tasks to this team'
    });
  }

  const project = team.projects.id(req.params.projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  const task = {
    title: req.body.title,
    description: req.body.description,
    assignedTo: req.body.assignedTo,
    dueDate: req.body.dueDate,
    status: 'todo'
  };

  project.tasks.push(task);
  await team.updateStats();
  await team.save();

  res.status(200).json({
    success: true,
    team
  });
});

// @desc    Update task status
// @route   PUT /api/teams/:id/projects/:projectId/tasks/:taskId
// @access  Private (Team Member)
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (!team.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update tasks in this team'
    });
  }

  const project = team.projects.id(req.params.projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  const task = project.tasks.id(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  task.status = req.body.status;
  
  if (req.body.status === 'completed') {
    team.activity.push({
      type: 'task_completed',
      user_id: req.user._id,
      description: `Completed task: ${task.title}`
    });
  }

  await team.updateStats();
  await team.save();

  res.status(200).json({
    success: true,
    team
  });
});

// @desc    Get team statistics
// @route   GET /api/teams/stats
// @access  Private
export const getTeamStats = asyncHandler(async (req, res) => {
  let query = { isActive: true };

  // Filter by user's involvement
  if (req.query.my === 'true') {
    query.$or = [
      { created_by: req.user._id },
      { 'members.user_id': req.user._id }
    ];
  }

  const totalTeams = await Team.countDocuments(query);
  const teamsAsLeader = await Team.countDocuments({ 
    ...query, 
    'members': { 
      $elemMatch: { 
        user_id: req.user._id, 
        role: 'leader' 
      } 
    } 
  });

  const activeProjects = await Team.aggregate([
    { $match: query },
    { $unwind: '$projects' },
    { $match: { 'projects.status': { $ne: 'completed' } } },
    { $count: 'total' }
  ]);

  const completedTasks = await Team.aggregate([
    { $match: query },
    { $unwind: '$projects' },
    { $unwind: '$projects.tasks' },
    { $match: { 'projects.tasks.status': 'completed' } },
    { $count: 'total' }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalTeams,
      teamsAsLeader,
      activeProjects: activeProjects[0]?.total || 0,
      completedTasks: completedTasks[0]?.total || 0
    }
  });
});
/**
 * 404 Not Found middleware
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile',
        'PUT /api/auth/profile'
      ],
      courses: [
        'GET /api/courses',
        'POST /api/courses',
        'GET /api/courses/:id',
        'PUT /api/courses/:id',
        'DELETE /api/courses/:id',
        'POST /api/courses/:id/enroll',
        'DELETE /api/courses/:id/enroll'
      ],
      assignments: [
        'GET /api/assignments',
        'POST /api/assignments',
        'GET /api/assignments/:id',
        'PUT /api/assignments/:id',
        'DELETE /api/assignments/:id',
        'POST /api/assignments/:id/submit',
        'GET /api/assignments/:id/submissions',
        'PUT /api/assignments/:id/submissions/:submissionId/grade'
      ],
      teams: [
        'GET /api/teams',
        'POST /api/teams',
        'GET /api/teams/:id',
        'PUT /api/teams/:id',
        'DELETE /api/teams/:id',
        'POST /api/teams/:id/join',
        'DELETE /api/teams/:id/leave'
      ],
      chatbot: [
        'POST /api/chatbot/ask',
        'GET /api/chatbot/conversations'
      ],
      health: ['GET /api/health']
    }
  });
  next(error);
};
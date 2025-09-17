import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.get('/users/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  }
};

// Course API
export const courseAPI = {
  getAllCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },
  
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },
  
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
  
  enrollInCourse: async (id) => {
    const response = await api.post(`/courses/${id}/enroll`);
    return response.data;
  },
  
  getCourseStats: async () => {
    const response = await api.get('/courses/stats/overview');
    return response.data;
  }
};

// Assignment API
export const assignmentAPI = {
  getAllAssignments: async (params = {}) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },
  
  getAssignment: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  
  createAssignment: async (assignmentData) => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },
  
  updateAssignment: async (id, assignmentData) => {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
  },
  
  deleteAssignment: async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },
  
  submitAssignment: async (id, submissionData) => {
    const response = await api.post(`/assignments/${id}/submit`, submissionData);
    return response.data;
  },
  
  getAssignmentStats: async () => {
    const response = await api.get('/assignments/stats');
    return response.data;
  }
};

// Team API
export const teamAPI = {
  getAllTeams: async (params = {}) => {
    const response = await api.get('/teams', { params });
    return response.data;
  },
  
  getTeam: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },
  
  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },
  
  updateTeam: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },
  
  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },
  
  joinTeam: async (id) => {
    const response = await api.post(`/teams/${id}/join`);
    return response.data;
  },
  
  leaveTeam: async (id) => {
    const response = await api.post(`/teams/${id}/leave`);
    return response.data;
  },
  
  addProject: async (id, projectData) => {
    const response = await api.post(`/teams/${id}/projects`, projectData);
    return response.data;
  },
  
  getTeamStats: async () => {
    const response = await api.get('/teams/stats');
    return response.data;
  }
};

// Chatbot API
export const chatbotAPI = {
  getConversation: async () => {
    const response = await api.get('/chatbot/conversation');
    return response.data;
  },
  
  sendMessage: async (messageData) => {
    const response = await api.post('/chatbot/message', messageData);
    return response.data;
  },
  
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/chatbot/conversation/${conversationId}/messages`, { params });
    return response.data;
  },
  
  addReaction: async (messageId, reactionData) => {
    const response = await api.post(`/chatbot/message/${messageId}/reaction`, reactionData);
    return response.data;
  },
  
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/chatbot/feedback', feedbackData);
    return response.data;
  },
  
  getHistory: async (params = {}) => {
    const response = await api.get('/chatbot/history', { params });
    return response.data;
  },
  
  closeConversation: async (conversationId) => {
    const response = await api.post(`/chatbot/conversation/${conversationId}/close`);
    return response.data;
  }
};

export default api;
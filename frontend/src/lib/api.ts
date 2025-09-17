import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    pages: number;
  };
}

// User interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher';
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: User | string;
  courseCode: string;
  coverImageUrl?: string;
  isActive: boolean;
  enrolledStudents: User[] | string[];
  maxStudents: number;
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  courseCode: string;
  coverImageUrl?: string;
  maxStudents?: number;
}

// Assignment interfaces
export interface Assignment {
  id: string;
  courseId: Course | string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  totalPoints: number;
  status: 'draft' | 'published' | 'closed';
  createdBy: User | string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  isOverdue?: boolean;
  daysUntilDue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentData {
  courseId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  totalPoints?: number;
}

// Submission interfaces
export interface Submission {
  id: string;
  assignmentId: Assignment | string;
  studentId: User | string;
  content: string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: User | string;
  isLate?: boolean;
  gradePercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionData {
  assignmentId: string;
  content: string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
}

export interface GradeSubmissionData {
  grade: number;
  feedback?: string;
}

// Authentication API
export const authAPI = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data!;
  },
};

// Courses API
export const coursesAPI = {
  async getCourses(params?: {
    search?: string;
    teacher?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; pagination: any }> {
    const response = await api.get<ApiResponse<Course[]>>('/courses', { params });
    return {
      courses: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  async getCourse(id: string): Promise<Course> {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data!;
  },

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data.data!;
  },

  async updateCourse(id: string, data: Partial<CreateCourseData>): Promise<Course> {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data.data!;
  },

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  async enrollInCourse(id: string): Promise<Course> {
    const response = await api.post<ApiResponse<Course>>(`/courses/${id}/enroll`);
    return response.data.data!;
  },

  async unenrollFromCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}/enroll`);
  },
};

// Assignments API
export const assignmentsAPI = {
  async getAssignments(params?: {
    course?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ assignments: Assignment[]; pagination: any }> {
    const response = await api.get<ApiResponse<Assignment[]>>('/assignments', { params });
    return {
      assignments: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  async getAssignment(id: string): Promise<Assignment> {
    const response = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    return response.data.data!;
  },

  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    const response = await api.post<ApiResponse<Assignment>>('/assignments', data);
    return response.data.data!;
  },

  async updateAssignment(id: string, data: Partial<CreateAssignmentData>): Promise<Assignment> {
    const response = await api.put<ApiResponse<Assignment>>(`/assignments/${id}`, data);
    return response.data.data!;
  },

  async deleteAssignment(id: string): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },
};

// Submissions API
export const submissionsAPI = {
  async getSubmissions(params?: {
    assignment?: string;
    student?: string;
    page?: number;
    limit?: number;
  }): Promise<{ submissions: Submission[]; pagination: any }> {
    const response = await api.get<ApiResponse<Submission[]>>('/submissions', { params });
    return {
      submissions: response.data.data!,
      pagination: response.data.pagination,
    };
  },

  async getSubmission(id: string): Promise<Submission> {
    const response = await api.get<ApiResponse<Submission>>(`/submissions/${id}`);
    return response.data.data!;
  },

  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    const response = await api.post<ApiResponse<Submission>>('/submissions', data);
    return response.data.data!;
  },

  async gradeSubmission(id: string, data: GradeSubmissionData): Promise<Submission> {
    const response = await api.put<ApiResponse<Submission>>(`/submissions/${id}/grade`, data);
    return response.data.data!;
  },
};

export default api;
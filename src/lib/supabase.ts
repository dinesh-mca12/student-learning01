import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'teacher'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  teacher_id: string
  code: string
  created_at: string
  updated_at: string
  teacher?: Profile
}

export interface Assignment {
  id: string
  course_id: string
  title: string
  description: string
  due_date: string
  max_points: number
  created_at: string
  updated_at: string
  course?: Course
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string
  submitted_at: string
  grade?: number
  feedback?: string
  graded_at?: string
  graded_by?: string
  assignment?: Assignment
  student?: Profile
}

export interface LiveClass {
  id: string
  course_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  meeting_url: string
  is_active: boolean
  created_at: string
  course?: Course
}

export interface Material {
  id: string
  course_id: string
  title: string
  description?: string
  file_url: string
  file_type: string
  uploaded_by: string
  created_at: string
  course?: Course
  uploader?: Profile
}

export interface Team {
  id: string
  name: string
  description?: string
  course_id?: string
  created_by: string
  created_at: string
  course?: Course
  creator?: Profile
}

export interface Channel {
  id: string
  team_id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  team?: Team
}

export interface Message {
  id: string
  channel_id: string
  user_id: string
  content: string
  created_at: string
  user?: Profile
  channel?: Channel
}

export interface ChatbotConversation {
  id: string
  user_id: string
  question: string
  answer: string
  created_at: string
  user?: Profile
}

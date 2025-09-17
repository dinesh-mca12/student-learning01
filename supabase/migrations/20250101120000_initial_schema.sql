/*
# Student Learning Management System - Initial Database Schema
This migration creates the complete database structure for a student learning platform with separate roles for students and teachers.

## Query Description: 
This operation creates a comprehensive database schema for a learning management system. It establishes user profiles, courses, assignments, submissions, live classes, materials, teams, channels, messages, and chatbot conversations. The schema includes proper relationships and RLS policies for data security. This is a safe initial setup operation with no existing data impact.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables: profiles, courses, assignments, submissions, live_classes, materials, teams, channels, messages, chatbot_conversations
- Enums: user_role, assignment_status, submission_status, live_class_status
- RLS: Enabled on all tables with role-based policies
- Triggers: Auto profile creation on user signup

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: JWT-based authentication with role separation

## Performance Impact:
- Indexes: Added on foreign keys and frequently queried columns
- Triggers: Auto-profile creation trigger
- Estimated Impact: Minimal - initial setup only
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded');
CREATE TYPE live_class_status AS ENUM ('scheduled', 'live', 'ended');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT UNIQUE NOT NULL,
    cover_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- Assignments table
CREATE TABLE assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    total_points INTEGER DEFAULT 100,
    status assignment_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    attachment_url TEXT,
    status submission_status DEFAULT 'pending',
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Live classes table
CREATE TABLE live_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    zoom_link TEXT,
    embedded_video_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status live_class_status DEFAULT 'scheduled',
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course materials
CREATE TABLE materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size BIGINT,
    is_public BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team memberships
CREATE TABLE team_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Channels table
CREATE TABLE channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot conversations
CREATE TABLE chatbot_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_live_classes_course ON live_classes(course_id);
CREATE INDEX idx_materials_course ON materials(course_id);
CREATE INDEX idx_team_memberships_user ON team_memberships(user_id);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_chatbot_conversations_user ON chatbot_conversations(user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Teachers can manage own courses" ON courses FOR ALL USING (auth.uid() = teacher_id);

-- Course enrollments policies
CREATE POLICY "Students can view own enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can enroll in courses" ON course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can view course enrollments" ON course_enrollments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = course_enrollments.course_id 
        AND courses.teacher_id = auth.uid()
    )
);

-- Assignments policies
CREATE POLICY "Course members can view assignments" ON assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM course_enrollments 
        WHERE course_enrollments.course_id = assignments.course_id 
        AND course_enrollments.student_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = assignments.course_id 
        AND courses.teacher_id = auth.uid()
    )
);
CREATE POLICY "Teachers can manage course assignments" ON assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = assignments.course_id 
        AND courses.teacher_id = auth.uid()
    )
);

-- Submissions policies
CREATE POLICY "Students can manage own submissions" ON submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view course submissions" ON submissions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assignments a
        JOIN courses c ON c.id = a.course_id
        WHERE a.id = submissions.assignment_id 
        AND c.teacher_id = auth.uid()
    )
);
CREATE POLICY "Teachers can grade submissions" ON submissions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM assignments a
        JOIN courses c ON c.id = a.course_id
        WHERE a.id = submissions.assignment_id 
        AND c.teacher_id = auth.uid()
    )
);

-- Live classes policies
CREATE POLICY "Course members can view live classes" ON live_classes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM course_enrollments 
        WHERE course_enrollments.course_id = live_classes.course_id 
        AND course_enrollments.student_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = live_classes.course_id 
        AND courses.teacher_id = auth.uid()
    )
);
CREATE POLICY "Teachers can manage course live classes" ON live_classes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = live_classes.course_id 
        AND courses.teacher_id = auth.uid()
    )
);

-- Materials policies
CREATE POLICY "Course members can view materials" ON materials FOR SELECT USING (
    is_public = true OR EXISTS (
        SELECT 1 FROM course_enrollments 
        WHERE course_enrollments.course_id = materials.course_id 
        AND course_enrollments.student_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = materials.course_id 
        AND courses.teacher_id = auth.uid()
    )
);
CREATE POLICY "Teachers can manage course materials" ON materials FOR ALL USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = materials.course_id 
        AND courses.teacher_id = auth.uid()
    )
);

-- Teams policies
CREATE POLICY "Users can view teams they belong to" ON teams FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_memberships 
        WHERE team_memberships.team_id = teams.id 
        AND team_memberships.user_id = auth.uid()
    ) OR created_by = auth.uid()
);
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Team creators can manage teams" ON teams FOR ALL USING (auth.uid() = created_by);

-- Team memberships policies
CREATE POLICY "Users can view team memberships" ON team_memberships FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM teams 
        WHERE teams.id = team_memberships.team_id 
        AND teams.created_by = auth.uid()
    )
);
CREATE POLICY "Users can join teams" ON team_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Channels policies
CREATE POLICY "Team members can view channels" ON channels FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_memberships 
        WHERE team_memberships.team_id = channels.team_id 
        AND team_memberships.user_id = auth.uid()
    )
);
CREATE POLICY "Team members can create channels" ON channels FOR INSERT WITH CHECK (
    auth.uid() = created_by AND EXISTS (
        SELECT 1 FROM team_memberships 
        WHERE team_memberships.team_id = channels.team_id 
        AND team_memberships.user_id = auth.uid()
    )
);

-- Messages policies
CREATE POLICY "Channel members can view messages" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM channels c
        JOIN team_memberships tm ON tm.team_id = c.team_id
        WHERE c.id = messages.channel_id 
        AND tm.user_id = auth.uid()
    )
);
CREATE POLICY "Channel members can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
        SELECT 1 FROM channels c
        JOIN team_memberships tm ON tm.team_id = c.team_id
        WHERE c.id = messages.channel_id 
        AND tm.user_id = auth.uid()
    )
);

-- Chatbot conversations policies
CREATE POLICY "Users can manage own chatbot conversations" ON chatbot_conversations FOR ALL USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

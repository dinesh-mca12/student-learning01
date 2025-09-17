import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Bot, 
  Settings, 
  LogOut,
  PlusCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { courseAPI, assignmentAPI, teamAPI } from '../lib/api';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeAssignments: 0,
    teamMembers: 0,
    completedTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats based on user role
      if (user?.role === 'teacher') {
        const courseStats = await courseAPI.getCourseStats();
        const assignmentStats = await assignmentAPI.getAssignmentStats();
        
        setStats({
          totalCourses: courseStats.stats?.total || 0,
          activeAssignments: assignmentStats.stats?.total || 0,
          teamMembers: 0,
          completedTasks: 0
        });
      } else {
        // Student stats
        const courses = await courseAPI.getAllCourses({ limit: 5 });
        const assignments = await assignmentAPI.getAllAssignments({ limit: 5 });
        
        setStats({
          totalCourses: courses.courses?.length || 0,
          activeAssignments: assignments.assignments?.length || 0,
          teamMembers: 0,
          completedTasks: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${bgColor}`}>
              <Icon size={24} className={color} />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-white">{value}</h3>
              <p className="text-gray-400">{title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const Navigation = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen p-6"
    >
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Learning Platform</h1>
        <p className="text-gray-400 text-sm">Welcome, {profile?.full_name}</p>
      </div>

      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 p-3 rounded-lg bg-blue-600 text-white"
        >
          <TrendingUp size={20} />
          <span>Dashboard</span>
        </Link>
        
        <Link
          to="/courses"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <BookOpen size={20} />
          <span>Courses</span>
        </Link>
        
        <Link
          to="/assignments"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <FileText size={20} />
          <span>Assignments</span>
        </Link>
        
        <Link
          to="/teams"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Users size={20} />
          <span>Teams</span>
        </Link>
        
        <Link
          to="/chatbot"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Bot size={20} />
          <span>AI Assistant</span>
        </Link>
        
        <Link
          to="/settings"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="mt-8">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );

  const QuickActions = () => {
    const actions = user?.role === 'teacher' ? [
      { label: 'Create Course', action: () => window.location.href = '/courses', icon: BookOpen },
      { label: 'Add Assignment', action: () => window.location.href = '/assignments', icon: FileText },
      { label: 'View Analytics', action: () => {}, icon: TrendingUp }
    ] : [
      { label: 'Browse Courses', action: () => window.location.href = '/courses', icon: BookOpen },
      { label: 'View Assignments', action: () => window.location.href = '/assignments', icon: FileText },
      { label: 'Join Team', action: () => window.location.href = '/teams', icon: Users }
    ];

    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant="outline"
                className="justify-start"
              >
                <action.icon size={16} className="mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="text-gray-400">
              {user?.role === 'teacher' 
                ? 'Manage your courses and track student progress' 
                : 'Continue your learning journey'
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={BookOpen}
              title={user?.role === 'teacher' ? 'Courses Created' : 'Enrolled Courses'}
              value={stats.totalCourses}
              color="text-blue-400"
              bgColor="bg-blue-500/20"
            />
            <StatCard
              icon={FileText}
              title="Active Assignments"
              value={stats.activeAssignments}
              color="text-green-400"
              bgColor="bg-green-500/20"
            />
            <StatCard
              icon={Users}
              title="Team Members"
              value={stats.teamMembers}
              color="text-purple-400"
              bgColor="bg-purple-500/20"
            />
            <StatCard
              icon={Calendar}
              title="Completed Tasks"
              value={stats.completedTasks}
              color="text-orange-400"
              bgColor="bg-orange-500/20"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-400">No recent activity to display</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Start by exploring courses or creating assignments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <QuickActions />
              
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Need help? Ask our AI assistant anything about your learning journey.
                  </p>
                  <Link to="/chatbot">
                    <Button className="w-full">
                      <Bot size={16} className="mr-2" />
                      Start Conversation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Users, 
  Clock, 
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { courseAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Course() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    code: '',
    category: 'Computer Science',
    level: 'Beginner'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = user?.role === 'teacher' ? { my: 'true' } : {};
      const response = await courseAPI.getAllCourses(params);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await courseAPI.createCourse(newCourse);
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setNewCourse({
        title: '',
        description: '',
        code: '',
        category: 'Computer Science',
        level: 'Beginner'
      });
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseAPI.deleteCourse(courseId);
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleEnrollInCourse = async (courseId) => {
    try {
      await courseAPI.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      fetchCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Navigation = () => (
    <div className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen p-6">
      <Link
        to="/dashboard"
        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Courses</h1>
        <p className="text-gray-400 text-sm">
          {user?.role === 'teacher' ? 'Manage your courses' : 'Explore and enroll'}
        </p>
      </div>

      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <BookOpen size={20} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/assignments"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <BookOpen size={20} />
          <span>Assignments</span>
        </Link>
        <Link
          to="/teams"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Users size={20} />
          <span>Teams</span>
        </Link>
      </nav>
    </div>
  );

  const CourseCard = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
              <p className="text-sm text-blue-400 mb-3 font-mono">{course.code}</p>
            </div>
            {user?.role === 'teacher' && course.teacher_id === user.id && (
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-400 text-sm mb-4 flex-1">
            {course.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              {course.category}
            </span>
            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {course.level}
            </span>
          </div>

          {course.teacher && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {course.teacher.full_name?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{course.teacher.full_name}</p>
                <p className="text-gray-400 text-xs">Instructor</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400 text-sm">
              <Users size={16} className="mr-1" />
              <span>{course.enrollment?.currentStudents || 0} enrolled</span>
            </div>
            
            {user?.role === 'student' && (
              <Button
                size="sm"
                onClick={() => handleEnrollInCourse(course.id)}
              >
                Enroll
              </Button>
            )}
            
            {user?.role === 'teacher' && course.teacher_id === user.id && (
              <Button size="sm" variant="outline">
                Manage
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Courses</h1>
              <p className="text-gray-400">
                {user?.role === 'teacher' 
                  ? 'Create and manage your courses' 
                  : 'Discover and enroll in courses'
                }
              </p>
            </div>
            
            {user?.role === 'teacher' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Create Course
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              />
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : user?.role === 'teacher' 
                      ? 'Create your first course to get started' 
                      : 'No courses available for enrollment'
                  }
                </p>
                {user?.role === 'teacher' && !searchTerm && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Course
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            placeholder="Enter course title"
            required
          />
          
          <Input
            label="Course Code"
            value={newCourse.code}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
            placeholder="e.g., CS101"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={newCourse.category}
              onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
            <select
              value={newCourse.level}
              onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              placeholder="Enter course description"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              rows={4}
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="flex-1"
            >
              Create Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
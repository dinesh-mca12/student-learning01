import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { assignmentAPI, courseAPI } from '../lib/api';
import { format, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

export default function Assignment() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    course_id: '',
    due_date: '',
    max_points: 100,
    type: 'homework',
    difficulty: 'medium'
  });
  const [submission, setSubmission] = useState({
    content: '',
    files: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse, coursesResponse] = await Promise.all([
        assignmentAPI.getAllAssignments(user?.role === 'teacher' ? { my: 'true' } : {}),
        courseAPI.getAllCourses(user?.role === 'teacher' ? { my: 'true' } : {})
      ]);
      
      setAssignments(assignmentsResponse.assignments || []);
      setCourses(coursesResponse.courses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await assignmentAPI.createAssignment(newAssignment);
      toast.success('Assignment created successfully!');
      setShowCreateModal(false);
      setNewAssignment({
        title: '',
        description: '',
        course_id: '',
        due_date: '',
        max_points: 100,
        type: 'homework',
        difficulty: 'medium'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await assignmentAPI.submitAssignment(selectedAssignment.id, submission);
      toast.success('Assignment submitted successfully!');
      setShowSubmitModal(false);
      setSubmission({ content: '', files: [] });
      setSelectedAssignment(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await assignmentAPI.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const getStatusInfo = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isOverdue = isBefore(dueDate, now);

    if (isOverdue) {
      return {
        icon: AlertCircle,
        text: 'Overdue',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20'
      };
    } else {
      return {
        icon: Clock,
        text: 'Pending',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20'
      };
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-xl font-bold text-white">Assignments</h1>
        <p className="text-gray-400 text-sm">
          {user?.role === 'teacher' ? 'Manage assignments' : 'View and submit'}
        </p>
      </div>

      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <FileText size={20} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/courses"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <FileText size={20} />
          <span>Courses</span>
        </Link>
        <Link
          to="/teams"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <FileText size={20} />
          <span>Teams</span>
        </Link>
      </nav>
    </div>
  );

  const AssignmentCard = ({ assignment }) => {
    const status = getStatusInfo(assignment);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{assignment.title}</h3>
                <p className="text-sm text-blue-400 mb-2">{assignment.course?.title}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className={`flex items-center px-2 py-1 rounded ${status.bgColor}`}>
                    <status.icon size={14} className={`mr-1 ${status.color}`} />
                    <span className={status.color}>{status.text}</span>
                  </span>
                  <span className="bg-gray-700 px-2 py-1 rounded capitalize">
                    {assignment.type}
                  </span>
                  <span className="bg-gray-700 px-2 py-1 rounded capitalize">
                    {assignment.difficulty}
                  </span>
                </div>
              </div>
              
              {user?.role === 'teacher' && (
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {assignment.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}</span>
              </div>
              <span className="font-medium">{assignment.max_points} points</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Created {format(new Date(assignment.createdAt || Date.now()), 'MMM dd')}
              </div>
              
              {user?.role === 'student' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowSubmitModal(true);
                  }}
                >
                  <Upload size={16} className="mr-1" />
                  Submit
                </Button>
              )}
              
              {user?.role === 'teacher' && (
                <Button size="sm" variant="outline">
                  View Submissions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading assignments...</div>
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
              <h1 className="text-3xl font-bold text-white mb-2">Assignments</h1>
              <p className="text-gray-400">
                {user?.role === 'teacher' 
                  ? 'Create and manage assignments for your courses' 
                  : 'View and submit your assignments'
                }
              </p>
            </div>
            
            {user?.role === 'teacher' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Create Assignment
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              />
            </div>
          </div>

          {/* Assignments Grid */}
          {filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No assignments found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : user?.role === 'teacher' 
                      ? 'Create your first assignment to get started' 
                      : 'No assignments available at the moment'
                  }
                </p>
                {user?.role === 'teacher' && !searchTerm && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Assignment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <Input
            label="Assignment Title"
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            placeholder="Enter assignment title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
            <select
              value={newAssignment.course_id}
              onChange={(e) => setNewAssignment({ ...newAssignment, course_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={newAssignment.type}
                onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              >
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="exam">Exam</option>
                <option value="discussion">Discussion</option>
                <option value="lab">Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={newAssignment.difficulty}
                onChange={(e) => setNewAssignment({ ...newAssignment, difficulty: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="datetime-local"
              value={newAssignment.due_date}
              onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
              required
            />

            <Input
              label="Maximum Points"
              type="number"
              value={newAssignment.max_points}
              onChange={(e) => setNewAssignment({ ...newAssignment, max_points: parseInt(e.target.value) })}
              min="1"
              max="1000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              placeholder="Enter assignment description and instructions"
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
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit: ${selectedAssignment?.title}`}
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Submission</label>
            <textarea
              value={submission.content}
              onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
              placeholder="Enter your submission content here..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
              rows={6}
              required
            />
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong>Due:</strong> {selectedAssignment && format(new Date(selectedAssignment.due_date), 'MMM dd, yyyy HH:mm')}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              <strong>Points:</strong> {selectedAssignment?.max_points}
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="flex-1"
            >
              Submit Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Users, BookOpen, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { courseAPI } from '../lib/api'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface Course {
  id: string
  title: string
  description: string
  code: string
  teacher: {
    id: string
    fullName: string
    email: string
    avatarUrl?: string
  }
  difficulty: string
  enrollmentCount?: number
  isEnrolled?: boolean
  enrollmentStatus?: string
  createdAt: string
  updatedAt: string
}

export function Courses() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    description: '', 
    code: '', 
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCourses()
    if (location.state?.openCreateCourse) {
      setShowCreateModal(true)
    }
  }, [profile, location.state])

  const fetchCourses = async () => {
    if (!profile) return
    try {
      setLoading(true)
      const params: any = {}
      
      // If teacher, show their courses; if student, show all courses
      if (profile.role === 'teacher') {
        params.my_courses = 'true'
      }
      
      const response = await courseAPI.getCourses(params)
      
      if (response.success) {
        setCourses(response.data.courses || [])
      } else {
        toast.error(response.message || 'Failed to load courses')
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load courses'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || profile.role !== 'teacher') return
    
    setIsSubmitting(true)
    try {
      const response = await courseAPI.createCourse(newCourse)
      
      if (response.success) {
        toast.success('Course created successfully!')
        setShowCreateModal(false)
        setNewCourse({ title: '', description: '', code: '', difficulty: 'beginner' })
        fetchCourses()
      } else {
        toast.error(response.message || 'Failed to create course')
      }
    } catch (error: any) {
      console.error('Error creating course:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create course'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return
    
    try {
      const response = await courseAPI.deleteCourse(courseId)
      
      if (response.success) {
        toast.success('Course deleted successfully!')
        setCourses(courses.filter(c => c.id !== courseId))
      } else {
        toast.error(response.message || 'Failed to delete course')
      }
    } catch (error: any) {
      console.error('Error deleting course:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete course. It might have associated assignments.'
      toast.error(errorMessage)
    }
  }

  const handleEnrollToggle = async (course: Course) => {
    try {
      if (course.isEnrolled) {
        const response = await courseAPI.unenrollFromCourse(course.id)
        if (response.success) {
          toast.success('Successfully unenrolled from course')
          fetchCourses()
        }
      } else {
        const response = await courseAPI.enrollInCourse(course.id)
        if (response.success) {
          toast.success('Successfully enrolled in course')
          fetchCourses()
        }
      }
    } catch (error: any) {
      console.error('Error toggling enrollment:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update enrollment'
      toast.error(errorMessage)
    }
  }

  const generateSampleCourses = async () => {
    if (!profile || profile.role !== 'teacher') return
    
    const sampleCourses = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
        code: 'WEB101',
        difficulty: 'beginner' as const
      },
      {
        title: 'Advanced React Development',
        description: 'Master React hooks, context, and advanced patterns for building scalable applications.',
        code: 'REACT201',
        difficulty: 'advanced' as const
      },
      {
        title: 'Database Design and SQL',
        description: 'Learn database design principles and master SQL queries for data management.',
        code: 'DB150',
        difficulty: 'intermediate' as const
      }
    ]

    try {
      for (const course of sampleCourses) {
        await courseAPI.createCourse(course)
      }
      toast.success('Sample courses created!')
      fetchCourses()
    } catch (error: any) {
      console.error('Error creating sample courses:', error)
      toast.error('Failed to create sample courses')
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Courses</h1>
          <p className="text-gray-400">
            {profile?.role === 'teacher' ? 'Manage your courses and content' : 'Browse and access your enrolled courses'}
          </p>
        </div>
        {profile?.role === 'teacher' && (
          <div className="flex space-x-3">
            <Button onClick={generateSampleCourses} variant="outline" className="hidden md:flex">Generate Samples</Button>
            <Button onClick={() => setShowCreateModal(true)}><Plus size={20} /> Create Course</Button>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input placeholder="Search courses by title, code, or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </motion.div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input label="Course Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required />
          <Input label="Course Code" placeholder="e.g., CS101" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })} required />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <select 
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-blue-500"
              value={newCourse.difficulty}
              onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-blue-500" 
              rows={4} 
              value={newCourse.description} 
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} 
              required 
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create Course</Button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="group h-full flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg"><BookOpen size={24} className="text-blue-400" /></div>
                      <div className="flex-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          course.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          course.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                    {profile?.id === course.teacher.id && (
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-blue-400"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-sm text-blue-400 mb-3 font-mono">{course.code}</p>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{course.description}</p>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{course.teacher.fullName?.charAt(0) || 'T'}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{course.teacher.fullName}</p>
                      <p className="text-gray-400 text-xs">Instructor</p>
                    </div>
                  </div>

                  {course.enrollmentCount !== undefined && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-400">{course.enrollmentCount} enrolled</span>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-auto">
                    <Button 
                      className="flex-1" 
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View Course
                    </Button>
                    {profile?.role === 'student' && (
                      <Button
                        variant={course.isEnrolled ? "outline" : "default"}
                        onClick={() => handleEnrollToggle(course)}
                        className="px-4"
                      >
                        {course.isEnrolled ? 'Enrolled' : 'Enroll'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{searchTerm ? 'No courses found' : 'No courses available'}</h3>
          <p className="text-gray-500 mb-4">{searchTerm ? 'Try adjusting your search' : (profile?.role === 'teacher' ? 'Create your first course to get started' : 'No courses are available right now.')}</p>
          {profile?.role === 'teacher' && !searchTerm && <Button onClick={() => setShowCreateModal(true)}><Plus size={20} /> Create First Course</Button>}
        </motion.div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Course, Assignment, coursesAPI, assignmentsAPI } from '../lib/api'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { BookOpen, FileText, Video, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
    }
  }, [courseId])

  const fetchCourseDetails = async () => {
    if (!courseId) return
    try {
      setLoading(true)

      // Fetch course details
      const courseData = await coursesAPI.getCourse(courseId)
      setCourse(courseData)

      // Fetch assignments for the course
      const { assignments: assignmentsData } = await assignmentsAPI.getAssignments({ course: courseId })
      setAssignments(assignmentsData)

    } catch (error: any) {
      console.error('Error fetching course details:', error)
      toast.error('Failed to load course details.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
        <Link to="/courses" className="text-blue-400 hover:underline">
          Back to Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/courses" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Courses
        </Link>
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-blue-500/20 rounded-lg">
            <BookOpen size={32} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{course.title}</h1>
            <p className="text-gray-400 font-mono">{course.code}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Course Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Assignments</h2>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <ul className="space-y-3">
                  {assignments.map(assignment => (
                    <li key={assignment.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{assignment.title}</p>
                        <p className="text-sm text-gray-400">Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</p>
                      </div>
                      <Link to="/assignments" className="text-blue-400 text-sm hover:underline">View</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-4">No assignments for this course yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Instructor</h2>
            </CardHeader>
            <CardContent>
              {typeof course.teacherId === 'object' && course.teacherId && (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {course.teacherId.fullName?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{course.teacherId.fullName}</p>
                    <p className="text-gray-400 text-sm">Instructor</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Resources</h2>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex items-center text-gray-400">
                  <FileText size={16} className="mr-2" />
                  <p>Course Materials (Coming Soon)</p>
                </div>
                <div className="flex items-center text-gray-400">
                  <Video size={16} className="mr-2" />
                  <p>Live Classes (Coming Soon)</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Calendar, FileText, CheckCircle, AlertCircle, Clock, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { assignmentAPI, courseAPI } from '../lib/api'
import { format, isBefore } from 'date-fns'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface Course {
  id: string
  title: string
  code: string
}

interface Assignment {
  id: string
  title: string
  description: string
  instructions?: string
  course: Course
  dueDate: string
  totalPoints: number
  status: string
  submission?: any
  isSubmitted?: boolean
  createdAt: string
  updatedAt: string
}

interface Submission {
  id: string
  content: string
  submittedAt: string
  grade?: number
  feedback?: string
  status: string
  student: {
    fullName: string
    email: string
  }
}

export function Assignments() {
  const { profile } = useAuth()
  const location = useLocation()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', max_points: 100, course_id: '' })
  const [currentSubmission, setCurrentSubmission] = useState({ assignmentId: '', content: '' })

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  useEffect(() => {
    if (profile) {
      fetchData()
      if (location.state?.openCreateAssignment) {
        setShowCreateModal(true)
      }
    }
  }, [profile, location.state])

  const fetchData = async () => {
    if (!profile) return
    
    try {
      setLoading(true)
      
      if (profile.role === 'teacher') {
        // Fetch teacher's courses for assignment creation
        const coursesResponse = await courseAPI.getCourses({ my_courses: 'true' })
        if (coursesResponse.success) {
          setTeacherCourses(coursesResponse.data.courses || [])
        }
        
        // Fetch teacher's assignments
        const assignmentsResponse = await assignmentAPI.getAssignments({ my_assignments: 'true' })
        if (assignmentsResponse.success) {
          setAssignments(assignmentsResponse.data.assignments || [])
        }
      } else {
        // Fetch student's assignments
        const assignmentsResponse = await assignmentAPI.getAssignments()
        if (assignmentsResponse.success) {
          setAssignments(assignmentsResponse.data.assignments || [])
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load data'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || profile.role !== 'teacher' || !newAssignment.course_id) {
      toast.error('Please select a course.')
      return
    }
    
    setIsSubmitting(true)
    try {
      const assignmentData = {
        title: newAssignment.title,
        description: newAssignment.description,
        course_id: newAssignment.course_id,
        dueDate: new Date(newAssignment.due_date).toISOString(),
        totalPoints: newAssignment.max_points
      }
      
      const response = await assignmentAPI.createAssignment(assignmentData)
      
      if (response.success) {
        toast.success('Assignment created!')
        setShowCreateModal(false)
        setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, course_id: '' })
        fetchData()
      } else {
        toast.error(response.message || 'Failed to create assignment')
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create assignment'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || profile.role !== 'student' || !currentSubmission.content) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('submissions').insert([{
        assignment_id: currentSubmission.assignmentId,
        student_id: profile.id,
        content: currentSubmission.content,
        submitted_at: new Date().toISOString()
      }])
      if (error) throw error
      toast.success('Assignment submitted!')
      setShowSubmitModal(false)
      setCurrentSubmission({ assignmentId: '', content: '' })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    try {
      await supabase.from('submissions').delete().eq('assignment_id', assignmentId)
      await supabase.from('assignments').delete().eq('id', assignmentId)
      toast.success('Assignment deleted successfully!')
      fetchData()
    } catch (error: any) {
      toast.error('Failed to delete assignment.')
    }
  }

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowSubmissionsModal(true)
    setLoadingSubmissions(true)
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, student:profiles(*)')
        .eq('assignment_id', assignment.id)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      setAssignmentSubmissions(data || [])
    } catch (error: any) {
      toast.error('Failed to load submissions.')
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const generateSampleAssignments = async () => {
    if (teacherCourses.length === 0) {
      toast.error('Please create a course first.')
      return
    }
    const samples = Array.from({ length: 3 }, () => ({
      title: faker.lorem.sentence(5),
      description: faker.lorem.paragraphs(2),
      due_date: faker.date.future().toISOString(),
      max_points: faker.helpers.arrayElement([50, 100, 150]),
      course_id: faker.helpers.arrayElement(teacherCourses).id
    }))
    try {
      await supabase.from('assignments').insert(samples)
      toast.success('Sample assignments created!')
      fetchData()
    } catch (error) {
      toast.error('Failed to create samples.')
    }
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    if (profile?.role === 'student') {
      const submission = submissions.find(s => s.assignment_id === assignment.id)
      if (submission) return submission.grade !== null ? 'graded' : 'submitted'
    }
    return isBefore(new Date(assignment.due_date), new Date()) ? 'overdue' : 'active'
  }

  const statusConfig = {
    submitted: { text: 'Submitted', color: 'text-blue-400 bg-blue-500/20', icon: CheckCircle },
    graded: { text: 'Graded', color: 'text-green-400 bg-green-500/20', icon: CheckCircle },
    overdue: { text: 'Overdue', color: 'text-red-400 bg-red-500/20', icon: AlertCircle },
    active: { text: 'Active', color: 'text-gray-400 bg-gray-500/20', icon: Clock }
  }

  const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.course?.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Assignments</h1>
          <p className="text-gray-400">{profile?.role === 'teacher' ? 'Create and manage assignments' : 'View and submit your assignments'}</p>
        </div>
        {profile?.role === 'teacher' && (
          <div className="flex space-x-3">
            <Button onClick={generateSampleAssignments} variant="outline" className="hidden md:flex">Generate Samples</Button>
            <Button onClick={() => setShowCreateModal(true)}><Plus size={20} /> Create Assignment</Button>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input placeholder="Search assignments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </motion.div>
      
      {/* Modals */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <Input label="Title" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} required />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
            <select value={newAssignment.course_id} onChange={e => setNewAssignment({...newAssignment, course_id: e.target.value})} required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">Select a course</option>
              {teacherCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </div>
          <Input label="Due Date" type="datetime-local" value={newAssignment.due_date} onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})} required />
          <Input label="Max Points" type="number" value={newAssignment.max_points} onChange={e => setNewAssignment({...newAssignment, max_points: parseInt(e.target.value)})} required />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea rows={3} value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assignment">
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Submission</label>
            <textarea rows={8} value={currentSubmission.content} onChange={e => setCurrentSubmission({...currentSubmission, content: e.target.value})} required className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="Type your submission here..."/>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Submit</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSubmissionsModal} onClose={() => setShowSubmissionsModal(false)} title={`Submissions for "${selectedAssignment?.title}"`}>
        {loadingSubmissions ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : assignmentSubmissions.length > 0 ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            {assignmentSubmissions.map(sub => (
              <div key={sub.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-white">{sub.student?.full_name}</p>
                  <p className="text-xs text-gray-400">{format(new Date(sub.submitted_at), 'MMM d, h:mm a')}</p>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded">{sub.content}</p>
                {/* Grading UI can be added here */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 p-8">No submissions yet for this assignment.</p>
        )}
      </Modal>

      {/* Assignments List */}
      {loading ? <div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div> : filteredAssignments.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {filteredAssignments.map((assignment, index) => {
            const status = getAssignmentStatus(assignment)
            const { text, color, icon: StatusIcon } = statusConfig[status as keyof typeof statusConfig]
            const submission = submissions.find(s => s.assignment_id === assignment.id)
            return (
              <motion.div key={assignment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card animate={false}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{assignment.title}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${color}`}><StatusIcon size={12} className="mr-1" /> {text}</div>
                        </div>
                        <p className="text-blue-400 text-sm mb-3">{assignment.course?.title}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                          <div className="flex items-center"><Calendar size={16} className="mr-2" /> Due: {format(new Date(assignment.due_date), 'MMM d, h:mm a')}</div>
                          <div className="flex items-center"><FileText size={16} className="mr-2" /> {assignment.max_points} points</div>
                        </div>
                        {submission && (
                          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-sm">
                            <p>Submitted: {format(new Date(submission.submitted_at), 'MMM d, h:mm a')}</p>
                            {submission.grade && <p className="text-green-400 font-medium">Grade: {submission.grade}/{assignment.max_points}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 items-end">
                        {profile?.role === 'teacher' ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleViewSubmissions(assignment)}>View Submissions</Button>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="p-2"><Edit size={14}/></Button>
                                <Button size="sm" variant="outline" className="p-2 hover:bg-red-500/20" onClick={() => handleDeleteAssignment(assignment.id)}><Trash2 size={14}/></Button>
                            </div>
                          </>
                        ) : (
                          !submission ? (
                            <Button size="sm" onClick={() => { setCurrentSubmission({ assignmentId: assignment.id, content: '' }); setShowSubmitModal(true); }}>Submit</Button>
                          ) : (
                            <Button size="sm" variant="outline">View Submission</Button>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{searchTerm ? 'No assignments found' : 'No assignments yet'}</h3>
          <p className="text-gray-500">{searchTerm ? 'Try a different search.' : 'Check back later for new assignments.'}</p>
        </motion.div>
      )}
    </div>
  )
}

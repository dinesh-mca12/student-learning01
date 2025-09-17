import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Bell,
  Video,
  FileText,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { format, isToday, isTomorrow } from 'date-fns'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalCourses: number
  activeAssignments: number
  upcomingClasses: number
  teamMembers: number
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'class' | 'assignment'
  time: string
  course: string
}

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    activeAssignments: 0,
    upcomingClasses: 0,
    teamMembers: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchDashboardData()
    }
  }, [profile])

  const fetchDashboardData = async () => {
    if (!profile) return

    try {
      setLoading(true)

      // Fetch courses based on role
      let coursesQuery = supabase.from('courses').select('id')
      
      if (profile.role === 'teacher') {
        coursesQuery = coursesQuery.eq('teacher_id', profile.id)
      } else {
        // For students, we'd filter by enrollment. For now, we count all.
      }

      const { data: courses, error: coursesError, count: courseCount } = await coursesQuery.limit(1000)
      if (coursesError) throw coursesError

      // Fetch assignments
      let assignmentsQuery = supabase
        .from('assignments')
        .select('*, course:courses(title)')
        .gte('due_date', new Date().toISOString())

      if (profile.role === 'teacher' && courses) {
        assignmentsQuery = assignmentsQuery.in('course_id', courses.map(c => c.id))
      }

      const { data: assignments, error: assignmentsError } = await assignmentsQuery
      if (assignmentsError) throw assignmentsError

      // Fetch live classes
      const { data: liveClasses, error: classesError } = await supabase
        .from('live_classes')
        .select('*, course:courses(title)')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5)

      if (classesError) throw classesError

      // Update stats
      setStats({
        totalCourses: courseCount || 0,
        activeAssignments: assignments?.length || 0,
        upcomingClasses: liveClasses?.length || 0,
        teamMembers: 0 // Placeholder
      })

      // Create upcoming events
      const events: UpcomingEvent[] = [
        ...(assignments || []).map(a => ({
          id: a.id,
          title: a.title,
          type: 'assignment' as const,
          time: a.due_date,
          course: a.course?.title || 'Unknown Course'
        })),
        ...(liveClasses || []).map(l => ({
          id: l.id,
          title: l.title,
          type: 'class' as const,
          time: l.scheduled_at,
          course: l.course?.title || 'Unknown Course'
        }))
      ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()).slice(0, 5)

      setUpcomingEvents(events)

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatEventTime = (time: string) => {
    const date = new Date(time)
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`
    return format(date, 'MMM d, h:mm a')
  }

  const statCards = [
    { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { title: 'Active Assignments', value: stats.activeAssignments, icon: FileText, color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { title: 'Upcoming Classes', value: stats.upcomingClasses, icon: Video, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { title: 'Team Members', value: stats.teamMembers, icon: Users, color: 'text-orange-400', bgColor: 'bg-orange-500/20' }
  ]

  const teacherActions = [
    { label: 'Create New Course', action: () => navigate('/courses', { state: { openCreateCourse: true } }), color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Add Assignment', action: () => navigate('/assignments', { state: { openCreateAssignment: true } }), color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Schedule Class', action: () => navigate('/live-classes'), color: 'bg-purple-600 hover:bg-purple-700' }
  ]

  const studentActions = [
    { label: 'Browse Courses', action: () => navigate('/courses'), color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'View Assignments', action: () => navigate('/assignments'), color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Join Live Class', action: () => navigate('/live-classes'), color: 'bg-purple-600 hover:bg-purple-700' }
  ]
  
  const commonAction = { label: 'Ask AI Assistant', action: () => navigate('/chatbot'), icon: Bot, color: 'bg-gray-600 hover:bg-gray-700' }

  const quickActions = profile?.role === 'teacher' ? teacherActions : studentActions

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-400">Welcome to your {profile?.role} dashboard</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">
          <Bell size={20} />
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <motion.p className="text-3xl font-bold text-white" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}>
                      {loading ? '-' : stat.value}
                    </motion.p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}><stat.icon size={24} className={stat.color} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card>
            <CardHeader><h2 className="text-xl font-semibold text-white flex items-center"><Calendar className="mr-2" size={20} /> Upcoming Events</h2></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="animate-pulse h-16 bg-gray-700 rounded-lg"></div>)}</div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors duration-200">
                      <div className={`p-2 rounded-lg mr-4 ${event.type === 'class' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                        {event.type === 'class' ? <Video size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{event.title}</h3>
                        <p className="text-sm text-gray-400">{event.course}</p>
                      </div>
                      <div className="text-right"><p className="text-sm text-gray-300">{formatEventTime(event.time)}</p></div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400"><Calendar size={48} className="mx-auto mb-4 opacity-50" /><p>No upcoming events</p></div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader><h2 className="text-xl font-semibold text-white">Quick Actions</h2></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map(action => (
                  <motion.button key={action.label} onClick={action.action} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full p-4 rounded-lg text-white font-medium transition-colors duration-200 ${action.color}`}>
                    {action.label}
                  </motion.button>
                ))}
                <motion.button onClick={commonAction.action} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full p-4 rounded-lg text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${commonAction.color}`}>
                  <commonAction.icon size={20} /> {commonAction.label}
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

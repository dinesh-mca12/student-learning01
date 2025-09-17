import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { Assignment, assignmentsAPI } from '../lib/api'
import { format, isBefore } from 'date-fns'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function Assignments() {
  const { profile } = useAuth()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAssignments()
  }, [profile])

  const fetchAssignments = async () => {
    if (!profile) return
    try {
      setLoading(true)
      const { assignments: data } = await assignmentsAPI.getAssignments()
      setAssignments(data || [])
    } catch (error: any) {
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Assignments</h1>
          <p className="text-gray-400">Manage and track your assignments</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No assignments found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No assignments have been created yet.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          filteredAssignments.map((assignment, index) => (
            <motion.div key={assignment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="group h-full flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <FileText size={24} className="text-green-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {isBefore(new Date(assignment.dueDate), new Date()) ? (
                        <AlertCircle size={16} className="text-red-400" />
                      ) : (
                        <Clock size={16} className="text-yellow-400" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{assignment.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{assignment.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Due Date:</span>
                      <span className={`font-medium ${isBefore(new Date(assignment.dueDate), new Date()) ? 'text-red-400' : 'text-yellow-400'}`}>
                        {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Points:</span>
                      <span className="text-white font-medium">{assignment.totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-medium capitalize ${
                        assignment.status === 'published' ? 'text-green-400' : 
                        assignment.status === 'draft' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <Button className="w-full" disabled={assignment.status !== 'published'}>
                      {profile?.role === 'student' ? 'Submit Assignment' : 'View Submissions'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}

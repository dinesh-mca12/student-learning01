import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Courses } from './pages/Courses'
import { Assignments } from './pages/Assignments'
import { Chatbot } from './pages/Chatbot'
import { CourseDetail } from './pages/CourseDetail'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
import { ReactNode } from 'react'

// Placeholder components for other pages
const Calendar = () => <div className="text-center py-12"><h1 className="text-2xl font-bold text-white mb-4">Calendar</h1><p className="text-gray-400">Calendar functionality coming soon!</p></div>
const LiveClasses = () => <div className="text-center py-12"><h1 className="text-2xl font-bold text-white mb-4">Live Classes</h1><p className="text-gray-400">Live classes functionality coming soon!</p></div>
const Teams = () => <div className="text-center py-12"><h1 className="text-2xl font-bold text-white mb-4">Teams</h1><p className="text-gray-400">Teams functionality coming soon!</p></div>
const Messages = () => <div className="text-center py-12"><h1 className="text-2xl font-bold text-white mb-4">Messages</h1><p className="text-gray-400">Messaging functionality coming soon!</p></div>
const Settings = () => <div className="text-center py-12"><h1 className="text-2xl font-bold text-white mb-4">Settings</h1><p className="text-gray-400">Settings functionality coming soon!</p></div>

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUpPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:courseId" element={<CourseDetail />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/live-classes" element={<LiveClasses />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#374151',
              color: '#f3f4f6',
              border: '1px solid #4b5563',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App

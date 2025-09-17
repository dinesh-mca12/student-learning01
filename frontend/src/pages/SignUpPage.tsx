import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password, fullName, role)
      setSignUpSuccess(true)
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  if (signUpSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md mx-auto"
        >
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full mx-auto flex items-center justify-center mb-6"
            >
              <CheckCircle size={40} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4">Verification Email Sent!</h2>
            <p className="text-gray-300 mb-6">
              We've sent a verification link to <strong className="text-white">{email}</strong>. Please check your inbox to complete your registration.
            </p>
            <Link to="/login">
              <Button variant="outline">Back to Sign In</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join the learning community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Role</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button type="button" onClick={() => setRole('student')} className={`p-3 rounded-lg border transition-all duration-200 ${role === 'student' ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Student</motion.button>
                <motion.button type="button" onClick={() => setRole('teacher')} className={`p-3 rounded-lg border transition-all duration-200 ${role === 'teacher' ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Teacher</motion.button>
              </div>
            </div>
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-300">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              <UserPlus size={20} />
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

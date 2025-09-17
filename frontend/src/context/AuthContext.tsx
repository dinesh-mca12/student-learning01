import { createContext, useState, useEffect, ReactNode } from 'react'
import { User, authAPI, LoginCredentials, RegisterData } from '../lib/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is logged in by checking for token
        const token = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setProfile(userData)
          
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authAPI.getProfile()
            setUser(currentUser)
            setProfile(currentUser)
            localStorage.setItem('user', JSON.stringify(currentUser))
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    try {
      const registerData: RegisterData = { email, password, fullName, role }
      const response = await authAPI.register(registerData)
      
      // Store token and user data
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setUser(response.user)
      setProfile(response.user)
      
      toast.success('Account created successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const credentials: LoginCredentials = { email, password }
      const response = await authAPI.login(credentials)
      
      // Store token and user data
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setUser(response.user)
      setProfile(response.user)
      
      toast.success('Signed in successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const signOut = async () => {
    try {
      // Clear storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      setUser(null)
      setProfile(null)
      
      toast.success('Signed out successfully!')
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(data)
      
      setUser(updatedUser)
      setProfile(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Profile update failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

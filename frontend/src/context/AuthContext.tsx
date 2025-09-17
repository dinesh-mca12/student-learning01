import { createContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  fullName: string
  role: 'student' | 'teacher'
  avatarUrl?: string
  phone?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  profile: User | null // Keep profile for backward compatibility
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user_profile')
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching fresh profile
          const response = await authAPI.getProfile()
          const userData = response.data.user
          setUser(userData)
          localStorage.setItem('user_profile', JSON.stringify(userData))
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_profile')
          setUser(null)
        }
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    try {
      const response = await authAPI.register({
        email,
        password,
        fullName,
        role
      })

      if (response.success) {
        const { user: userData, token } = response.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_profile', JSON.stringify(userData))
        setUser(userData)
        return response
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      throw new Error(errorMessage)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })

      if (response.success) {
        const { user: userData, token } = response.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_profile', JSON.stringify(userData))
        setUser(userData)
        return response
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      throw new Error(errorMessage)
    }
  }

  const signOut = async () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_profile')
    setUser(null)
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      if (response.success) {
        const updatedUser = response.data.user
        localStorage.setItem('user_profile', JSON.stringify(updatedUser))
        setUser(updatedUser)
        toast.success('Profile updated successfully')
      } else {
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const value = {
    user,
    profile: user, // For backward compatibility
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

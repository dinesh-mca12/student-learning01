import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  animate?: boolean
}

export function Card({ children, className = '', animate = true }: CardProps) {
  const baseClasses = 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg'

  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 border-b border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 border-t border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

import { motion } from 'framer-motion';

export function Input({ label, error, className = '', ...props }) {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg 
          text-white placeholder-gray-400 
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 
          focus:outline-none transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <motion.p 
          className="text-sm text-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
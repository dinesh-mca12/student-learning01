import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { chatbotAPI } from '../lib/api'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function Chatbot() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: '1',
      type: 'bot',
      content: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI learning assistant. I'm here to help you with:\n\n• Course-related questions\n• Assignment guidance\n• Study tips and strategies\n• Technical support\n• General academic advice\n\nWhat can I help you with today?`,
      timestamp: new Date()
    }])
  }, [profile])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const simulateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Course-related responses
    if (lowerMessage.includes('course') || lowerMessage.includes('class')) {
      return "I can help you with course-related questions! Here are some things I can assist with:\n\n• Finding course materials\n• Understanding course requirements\n• Navigating course content\n• Assignment deadlines\n\nWhat specific aspect would you like to know more about?"
    }

    // Assignment help
    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      return "I'd be happy to help with assignments! Here's how I can assist:\n\n• Understanding assignment requirements\n• Suggesting study strategies\n• Time management tips\n• Finding relevant resources\n• Formatting guidelines\n\nWhat assignment are you working on?"
    }

    // Study tips
    if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
      return "Great question about studying! Here are some effective study strategies:\n\n• 📚 Use active recall techniques\n• ⏰ Try the Pomodoro Technique (25-min focused sessions)\n• 📝 Create summary notes and mind maps\n• 👥 Form study groups with classmates\n• 🎯 Set specific, achievable goals\n\nWould you like me to elaborate on any of these techniques?"
    }

    // Technical support
    if (lowerMessage.includes('technical') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return "I'm here to help with technical issues! Common solutions:\n\n• 🔄 Try refreshing the page\n• 📱 Check your internet connection\n• 🧹 Clear your browser cache\n• 📞 Contact technical support if issues persist\n\nCan you describe the specific problem you're experiencing?"
    }

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm excited to help you with your learning journey. Whether you need help with courses, assignments, study strategies, or have technical questions, I'm here to assist. What would you like to explore today?"
    }

    // Default response
    return "That's an interesting question! While I can help with course-related topics, assignments, study strategies, and technical support, I might need a bit more context to give you the best answer.\n\nCould you please rephrase your question or let me know specifically what area you'd like help with? I'm here to make your learning experience better! 🌟"
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const questionText = currentMessage
    setCurrentMessage('')
    setIsTyping(true)

    try {
      // Call the backend chatbot API
      const response = await chatbotAPI.askQuestion({
        question: questionText,
        sessionId: profile?.id // Use user ID as session ID
      })

      if (response.success) {
        const botMessage: ChatMessage = {
          id: response.data.conversation.id,
          type: 'bot',
          content: response.data.conversation.answer,
          timestamp: new Date(response.data.conversation.createdAt)
        }

        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(response.message || 'Failed to get response')
      }
    } catch (error: any) {
      console.error('Error getting chatbot response:', error)
      
      // Fallback to client-side response
      const botResponse = simulateBotResponse(questionText)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "How do I submit an assignment?",
    "What are good study strategies?",
    "How can I join a live class?",
    "I'm having technical issues",
    "Tell me about course materials"
  ]

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Learning Assistant</h1>
            <p className="text-gray-400">Ask me anything about your studies!</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </div>
                    <div className={`p-4 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className={`text-xs mt-2 opacity-70`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="p-4 rounded-lg bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <Loader size={16} className="animate-spin text-gray-400" />
                      <span className="text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-4"
            >
              <p className="text-gray-400 text-sm mb-3 flex items-center">
                <Sparkles size={16} className="mr-2" />
                Quick questions to get started:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentMessage(question)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex space-x-3">
              <Input
                placeholder="Ask me anything about your studies..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="px-6"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

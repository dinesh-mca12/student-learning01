import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  User, 
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { chatbotAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const response = await chatbotAPI.getConversation();
      if (response.success) {
        setConversation(response.conversation);
        
        // If no messages, add welcome message
        if (!response.conversation.messages || response.conversation.messages.length === 0) {
          const welcomeMessage = {
            id: 'welcome-1',
            type: 'bot',
            content: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI learning assistant. I'm here to help you with:

• Course-related questions
• Assignment guidance
• Study tips and strategies
• Technical support
• General academic advice

What can I help you with today?`,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages(response.conversation.messages || []);
        }
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await chatbotAPI.sendMessage({
        content: currentMessage.trim(),
        conversationId: conversation?.id
      });

      if (response.success && response.conversation.messages) {
        // Get the latest bot message from the response
        const latestMessages = response.conversation.messages;
        const botMessage = latestMessages[latestMessages.length - 1];
        
        if (botMessage && botMessage.type === 'bot') {
          setMessages(prev => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId, reactionType) => {
    try {
      await chatbotAPI.addReaction(messageId, { type: reactionType });
      toast.success('Feedback submitted');
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const quickQuestions = [
    "How do I submit an assignment?",
    "What are good study strategies?",
    "How can I join a team?",
    "I'm having technical issues",
    "Tell me about course materials"
  ];

  const handleQuickQuestion = (question) => {
    setCurrentMessage(question);
  };

  const Navigation = () => (
    <div className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen p-6">
      <Link
        to="/dashboard"
        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">AI Assistant</h1>
        <p className="text-gray-400 text-sm">Get help with your learning</p>
      </div>

      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Bot size={20} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/courses"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Bot size={20} />
          <span>Courses</span>
        </Link>
        <Link
          to="/assignments"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Bot size={20} />
          <span>Assignments</span>
        </Link>
      </nav>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Quick Questions</h3>
        <div className="space-y-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="w-full text-left p-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-start space-x-3 max-w-[80%] ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600' 
              : 'bg-gradient-to-r from-purple-500 to-pink-600'
          }`}>
            {isUser ? (
              <User size={16} className="text-white" />
            ) : (
              <Bot size={16} className="text-white" />
            )}
          </div>
          
          <div className={`rounded-lg p-4 ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-100'
          }`}>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs opacity-70 mt-2">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            
            {!isUser && (
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={() => handleReaction(message.id, 'helpful')}
                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                  title="Helpful"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => handleReaction(message.id, 'not_helpful')}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Not helpful"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-b border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Learning Assistant</h1>
              <p className="text-gray-400">Ask me anything about your studies!</p>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                    <span className="text-gray-400 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-700">
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3">Quick questions to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none resize-none"
                rows={3}
                disabled={isTyping}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="self-end"
            >
              <Send size={16} />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            This AI assistant is designed to help with learning-related questions. 
            Responses are generated and may not always be accurate.
          </p>
        </div>
      </div>
    </div>
  );
}
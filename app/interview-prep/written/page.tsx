'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '../../contexts/UserContext'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  error?: boolean;
}

const WELCOME_MESSAGE_CONTENT = `### Welcome to JoSi! 👋

I'm your dedicated **placement guide** for St. Xavier's College Mumbai. I can help you with:

• Campus placements and processes
• Interview preparation
• Company information
• Career guidance

What would you like to know about our college's placement opportunities?`

export default function WrittenPractice() {
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Set welcome message after component mounts to avoid hydration issues
    setMessages([{
      role: 'bot',
      content: WELCOME_MESSAGE_CONTENT,
      timestamp: new Date().toISOString()
    }])
  }, [])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const botMessage: ChatMessage = { 
        role: 'bot', 
        content: data.response,
        timestamp: data.timestamp
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: ChatMessage = { 
        role: 'bot', 
        content: 'I apologize, but I encountered an error while processing your request. This might be due to API limits or connectivity issues. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        error: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 max-w-4xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-white">Written Interview Practice</h1>
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 mb-4 h-[600px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-4 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.error
                    ? 'bg-red-500 bg-opacity-20 text-white border border-red-400'
                    : 'bg-white bg-opacity-10 text-white'
                }`}
              >
                <ReactMarkdown 
                  components={{
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-yellow-300" {...props} />,
                    li: ({node, ...props}) => <li className="ml-4" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black bg-opacity-30 px-1 rounded" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                <div className="text-xs mt-2 opacity-50">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center">
              <div className="inline-block p-3 bg-white bg-opacity-10 text-white rounded-lg">
                Thinking...
              </div>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about placements, interviews, or career guidance..."
            className="flex-1 p-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </motion.div>
    </div>
  )
}

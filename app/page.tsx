'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase/config'
import { useUser } from './contexts/UserContext'

const ADMIN_EMAIL = 'admin@josi.com'

export default function Home() {
  const [isAdminView, setIsAdminView] = useState(false)
  const router = useRouter()
  const { login, signup, userProfile } = useUser()

  // Redirect if already logged in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/profile')
      }
    }
  }, [userProfile, router])

  const StudentForm = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      error: null as string | null
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value,
        error: null
      }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!formData.email.endsWith('@xaviers.edu.in')) {
        setFormData(prev => ({ ...prev, error: 'Email must end with @xaviers.edu.in' }))
        return
      }

      try {
        if (isLogin) {
          await login(formData.email, formData.password)
        } else {
          await signup(formData.email, formData.password)
          setIsLogin(true)
          return
        }
      } catch (error) {
        setFormData(prev => ({ ...prev, error: 'Authentication failed. Please try again.' }))
      }
    }

    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="studentEmail" className="block text-sm font-medium text-white">
              College Email
            </label>
            <input
              type="email"
              id="studentEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              pattern=".*@xaviers\.edu\.in$"
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="example@xaviers.edu.in"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="studentPassword" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              id="studentPassword"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          {formData.error && (
            <p className="text-red-500 text-sm">{formData.error}</p>
          )}
          <motion.button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLogin ? 'Log in' : 'Sign up'}
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setFormData({ email: '', password: '', error: null })
            }}
            className="text-sm text-white hover:underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
          </button>
        </div>
      </>
    )
  }

  const AdminForm = () => {
    const [formData, setFormData] = useState({
      email: ADMIN_EMAIL,
      password: '',
      error: null as string | null
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value,
        error: null
      }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (formData.email !== ADMIN_EMAIL) {
        setFormData(prev => ({ ...prev, error: 'Invalid admin email' }))
        return
      }

      try {
        await login(formData.email, formData.password)
      } catch (error) {
        setFormData(prev => ({ ...prev, error: 'Authentication failed. Please try again.' }))
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-white">
            Admin Email
          </label>
          <input
            type="email"
            id="adminEmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            placeholder={ADMIN_EMAIL}
            autoComplete="email"
            readOnly
          />
        </div>
        <div>
          <label htmlFor="adminPassword" className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            type="password"
            id="adminPassword"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            placeholder="Enter admin password"
            autoComplete="current-password"
          />
        </div>
        {formData.error && (
          <p className="text-red-500 text-sm">{formData.error}</p>
        )}
        <motion.button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Log in as Admin
        </motion.button>
      </form>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-purple-900">
      <motion.div
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            {isAdminView ? 'Admin Login' : 'Student Portal'}
          </h1>
          <p className="mt-2 text-gray-300">
            {isAdminView ? 'Access admin dashboard' : 'Sign in to your account'}
          </p>
        </div>

        {isAdminView ? <AdminForm /> : <StudentForm />}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsAdminView(!isAdminView)
            }}
            className="text-sm text-white hover:underline"
          >
            {isAdminView ? 'Student Login' : 'Admin Login'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

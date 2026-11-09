// app/edit-profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { useUser } from '../contexts/UserContext'

export default function EditProfile() {
  const { userProfile, updateProfile, loading, isProfileComplete } = useUser()
  const [name, setName] = useState('')
  const [uid, setUid] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') // Get the 'from' query parameter

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name)
      setUid(userProfile.uid)
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    if (!uid.trim()) {
      setError('UID is required.')
      return
    }

    try {
      await updateProfile({ name, uid })
      console.log('Profile updated successfully.')

      if (from === 'menu') {
        // If accessed from the Sliding Menu, redirect back to the previous page
        router.back()
      } else {
        // If initial setup, redirect to courses
        router.push('/courses')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Remove the following block to allow access to the Edit Profile page even if the profile is complete
  /*
  if (isProfileComplete) {
    router.push('/courses')
    return null
  }
  */

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Adjust the progress bar step based on context */}
        <ProgressBar currentStep={isProfileComplete ? 1 : 1} totalSteps={5} />
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          {isProfileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="uid" className="block text-sm font-medium text-white">
              College UID
            </label>
            <input
              id="uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <motion.button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Changes
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

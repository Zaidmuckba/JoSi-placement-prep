'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { useUser } from '../contexts/UserContext'

const courses = [
  { id: 1, name: 'IT', icon: '💻' },
  { id: 2, name: 'BMS', icon: '📊' },
  { id: 3, name: 'BMM', icon: '🎥' },
]

export default function CourseSelection() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const { setCourseCompanyAndRole } = useUser()

  console.log('Rendering CourseSelection component')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (selectedCourse !== null) {
      const course = courses.find(c => c.id === selectedCourse)?.name
      if (course) {
        console.log('Selected course:', course)
        try {
          // Update Firestore with the selected course
          await setCourseCompanyAndRole(course, '', '')
          console.log('Course set successfully. Navigating to /companies')
          router.push('/companies')
        } catch (error) {
          console.error('Error setting course:', error)
          setSubmitError('Failed to set course. Please try again.')
        }
      }
    } else {
      setSubmitError('Please select a course.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressBar currentStep={2} totalSteps={5} />
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Select Your Course
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {courses.map((course) => (
            <motion.button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourse(course.id)}
              className={`w-full p-4 rounded-lg text-left flex items-center ${
                selectedCourse === course.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl mr-4">{course.icon}</span>
              <span>{course.name}</span>
            </motion.button>
          ))}
          <motion.button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              selectedCourse === null
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
            whileHover={selectedCourse !== null ? { scale: 1.05 } : {}}
            whileTap={selectedCourse !== null ? { scale: 0.95 } : {}}
            disabled={selectedCourse === null}
          >
            Continue
          </motion.button>
          {submitError && (
            <p className="text-red-500 text-sm">{submitError}</p>
          )}
        </form>
      </motion.div>
    </div>
  )
}

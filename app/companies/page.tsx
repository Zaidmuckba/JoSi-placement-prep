// app/companies/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { useUser } from '../contexts/UserContext'

const companiesByCourse: { [key: string]: string[] } = {
  'IT': ['TCS', 'Infosys', 'Wipro', 'Accenture'],
  'BMS': ['KPMG', 'Deloitte', 'EY', 'PwC'],
  'BMM': ['WPP', 'Ogilvy', 'Dentsu', 'Publicis Groupe']
}

export default function CompanySelection() {
  const [companies, setCompanies] = useState<string[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const { userProfile, setCourseCompanyAndRole, loading } = useUser()

  useEffect(() => {
    console.log('User Profile:', userProfile)
    console.log('Loading State:', loading)

    if (loading) {
      console.log('Authentication state is loading...')
      return
    }

    if (!userProfile?.course) {
      console.log('Course is not set. Redirecting to course selection...')
      // Redirect to course selection page
      router.push('/courses') // Adjust the route as per your structure
      return
    }

    if (userProfile.course) {
      console.log(`Setting companies for course: ${userProfile.course}`)
      const selectedCompanies = companiesByCourse[userProfile.course]
      if (selectedCompanies) {
        setCompanies(selectedCompanies)
        console.log('Companies set:', selectedCompanies)
      } else {
        console.warn(`No companies found for course: ${userProfile.course}`)
        setCompanies([])
      }
    } else {
      console.warn('User profile or course is not available.')
      setCompanies([])
    }
  }, [userProfile?.course, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    console.log('Form submitted. Selected Company:', selectedCompany)

    if (selectedCompany && userProfile?.course) {
      try {
        console.log('Setting course, company, and role...')
        await setCourseCompanyAndRole(userProfile.course, selectedCompany, '')
        console.log('Redirecting to /roles')
        router.push('/roles') // Ensure you have a /roles page
      } catch (error) {
        console.error('Error setting course, company, and role:', error)
        setSubmitError('Failed to update your selection. Please try again.')
      }
    } else {
      setSubmitError('Please select a company.')
    }
  }

  console.log('Rendering CompanySelection component. User:', userProfile?.uid)

  // Handle loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressBar currentStep={3} totalSteps={5} />
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Select a Company
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-white">
              Company
            </label>
            <select
              id="company"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
          {submitError && (
            <p className="text-red-500 text-sm">{submitError}</p>
          )}
          <motion.button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              selectedCompany === ''
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
            whileHover={selectedCompany !== '' ? { scale: 1.05 } : {}}
            whileTap={selectedCompany !== '' ? { scale: 0.95 } : {}}
            disabled={selectedCompany === ''}
          >
            Continue
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

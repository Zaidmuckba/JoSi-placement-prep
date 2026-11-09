'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../components/ProgressBar'
import { useUser } from '../contexts/UserContext'

const rolesByCompany = {
  'TCS': ['Software Engineer', 'Business Analyst', 'Data Scientist'],
  'Infosys': ['Systems Engineer', 'Technical Consultant', 'Project Manager'],
  'Wipro': ['Software Developer', 'Cloud Engineer', 'DevOps Specialist'],
  'Accenture': ['Technology Consultant', 'Digital Strategist', 'UX Designer'],
  'KPMG': ['Financial Analyst', 'Risk Consultant', 'Management Trainee'],
  'Deloitte': ['Audit Associate', 'Tax Consultant', 'Strategy Analyst'],
  'EY': ['Assurance Associate', 'Advisory Consultant', 'Transaction Analyst'],
  'PwC': ['Audit Associate', 'Advisory Consultant', 'Tax Associate'],
  'WPP': ['Account Executive', 'Media Planner', 'Creative Designer'],
  'Ogilvy': ['Copywriter', 'Art Director', 'Strategic Planner'],
  'Dentsu': ['Digital Marketing Specialist', 'Media Buyer', 'Content Creator'],
  'Publicis Groupe': ['Account Manager', 'Brand Strategist', 'Social Media Specialist']
}

export default function RoleSelection() {
  const [roles, setRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const router = useRouter()
  const { userProfile, setCourseCompanyAndRole } = useUser()

  useEffect(() => {
    if (userProfile?.company) {
      setRoles(rolesByCompany[userProfile.company as keyof typeof rolesByCompany] || [])
    }
  }, [userProfile?.company])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRole && userProfile?.course && userProfile?.company) {
      setCourseCompanyAndRole(userProfile.course, userProfile.company, selectedRole)
      router.push('/resume')
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
        <ProgressBar currentStep={4} totalSteps={5} />
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Select a Role
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-white">
              Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!selectedRole}
          >
            Continue
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '../../components/ProgressBar'
import { useUser } from '../../contexts/UserContext'

const roles = {
  1: [
    { id: 1, name: 'Software Engineer', icon: '👨‍💻' },
    { id: 2, name: 'Product Manager', icon: '📊' },
    { id: 3, name: 'Data Scientist', icon: '🧮' },
  ],
  2: [
    { id: 1, name: 'Software Developer', icon: '💻' },
    { id: 2, name: 'Cloud Solutions Architect', icon: '☁️' },
    { id: 3, name: 'UX Designer', icon: '🎨' },
  ],
  3: [
    { id: 1, name: 'Software Development Engineer', icon: '🖥️' },
    { id: 2, name: 'Solutions Architect', icon: '🏗️' },
    { id: 3, name: 'Machine Learning Engineer', icon: '🤖' },
  ],
  4: [
    { id: 1, name: 'iOS Developer', icon: '📱' },
    { id: 2, name: 'Hardware Engineer', icon: '🔧' },
    { id: 3, name: 'Machine Learning Engineer', icon: '🧠' },
  ],
  5: [
    { id: 1, name: 'Software Engineer', icon: '👨‍💻' },
    { id: 2, name: 'Data Engineer', icon: '📈' },
    { id: 3, name: 'Product Designer', icon: '✏️' },
  ],
}

export default function RoleSelection({ params }: { params: { companyId: string } }) {
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const router = useRouter()
  const companyId = parseInt(params.companyId)
  const { setCompanyAndRole, userProfile } = useUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRole !== null && userProfile) {
      const role = roles[companyId].find(r => r.id === selectedRole)?.name
      if (role) {
        setCompanyAndRole(userProfile.company, role)
        router.push('/resume')
      }
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
          {roles[companyId].map((role) => (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`w-full p-4 rounded-lg text-left flex items-center ${
                selectedRole === role.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl mr-4">{role.icon}</span>
              <span>{role.name}</span>
            </motion.button>
          ))}
          <motion.button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedRole === null}
          >
            Continue
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}


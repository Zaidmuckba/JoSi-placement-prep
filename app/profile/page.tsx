'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '../contexts/UserContext'
import { db } from '../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

interface Company {
  id: string
  name: string
  course: string
}

interface Role {
  id: string
  name: string
  company: string
  course: string
}

export default function ProfileCreation() {
  const [name, setName] = useState('')
  const [uid, setUid] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { updateProfile, getUserProfile, user } = useUser()

  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const courses = ['BSc IT', 'BMS', 'BMM']

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setName(profile.name);
          setUid(profile.uid);
          setSelectedCourse(profile.course || '');
          setSelectedCompany(profile.company || '');
          setSelectedRole(profile.role || '');
        }
      } catch (error) {
        setError('Error fetching profile')
      }
    };
    fetchProfile();
  }, [getUserProfile]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCompanies()
    }
  }, [selectedCourse])

  useEffect(() => {
    if (selectedCompany) {
      fetchRoles()
    }
  }, [selectedCompany])

  const fetchCompanies = async () => {
    try {
      const q = query(collection(db, 'companies'), where('course', '==', selectedCourse))
      const querySnapshot = await getDocs(q)
      const companiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[]
      setCompanies(companiesData)
      setError(null)
    } catch (error) {
      setError('Failed to fetch companies')
    }
  }

  const fetchRoles = async () => {
    try {
      const q = query(
        collection(db, 'roles'),
        where('course', '==', selectedCourse),
        where('company', '==', selectedCompany)
      )
      const querySnapshot = await getDocs(q)
      const rolesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Role[]
      setRoles(rolesData)
      setError(null)
    } catch (error) {
      setError('Failed to fetch roles')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (uid.length !== 6 || !/^\d+$/.test(uid)) {
      setError('UID must be a 6-digit number')
      return
    }

    if (!selectedCourse || !selectedCompany || !selectedRole) {
      setError('Please fill in all fields')
      return
    }

    try {
      await updateProfile({ 
        name, 
        uid, 
        course: selectedCourse, 
        company: selectedCompany, 
        role: selectedRole 
      })
      router.push('/resume')
    } catch (error) {
      setError('Failed to update profile. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <motion.div
        className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          {name ? 'Edit Your Profile' : 'Create Your Profile'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/90">
              Name
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                       transition-all duration-200 ease-in-out"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="uid" className="block text-sm font-medium text-white/90">
              UID (6-digit number)
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              id="uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
              pattern="\d{6}"
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                       transition-all duration-200 ease-in-out"
              placeholder="Enter your 6-digit UID"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-white/90">
                Course
              </label>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                id="course"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedCompany('')
                  setSelectedRole('')
                }}
                required
                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                         transition-all duration-200 ease-in-out"
              >
                <option value="" className="bg-gray-900">Select your course</option>
                {courses.map(course => (
                  <option key={course} value={course} className="bg-gray-900">{course}</option>
                ))}
              </motion.select>
            </div>

            {selectedCourse && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-white/90">
                  Company
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="company"
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value)
                    setSelectedRole('')
                  }}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                           transition-all duration-200 ease-in-out"
                >
                  <option value="" className="bg-gray-900">Select a company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.name} className="bg-gray-900">
                      {company.name}
                    </option>
                  ))}
                </motion.select>
              </div>
            )}

            {selectedCompany && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-white/90">
                  Role
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                           transition-all duration-200 ease-in-out"
                >
                  <option value="" className="bg-gray-900">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name} className="bg-gray-900">
                      {role.name}
                    </option>
                  ))}
                </motion.select>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg
                     hover:from-violet-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                     transform transition-all duration-200 ease-in-out"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {name ? 'Update Profile' : 'Create Profile'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

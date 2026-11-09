'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { db } from '../../firebase/config'
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'

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

export default function RoleManager() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [newRole, setNewRole] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('BSc IT')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [error, setError] = useState<string | null>(null)

  const courses = ['BSc IT', 'BMS', 'BMM']

  useEffect(() => {
    fetchCompanies()
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
      if (companiesData.length > 0 && !selectedCompany) {
        setSelectedCompany(companiesData[0].name)
      }
      setError(null)
    } catch (error) {
      console.error('Error fetching companies:', error)
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
      console.error('Error fetching roles:', error)
      setError('Failed to fetch roles')
    }
  }

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRole.trim() || !selectedCompany) {
      setError('Please enter a role name and select a company')
      return
    }

    try {
      await addDoc(collection(db, 'roles'), {
        name: newRole.trim(),
        company: selectedCompany,
        course: selectedCourse
      })
      setNewRole('')
      setError(null)
      fetchRoles()
    } catch (error) {
      console.error('Error adding role:', error)
      setError('Failed to add role')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteDoc(doc(db, 'roles', roleId))
      setError(null)
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      setError('Failed to delete role')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value)
              setSelectedCompany('')
            }}
            className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-800"
          >
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Select Company
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-800"
          >
            <option value="">Select a company</option>
            {companies.map(company => (
              <option key={company.id} value={company.name}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCompany && (
        <form onSubmit={handleAddRole} className="flex space-x-4">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Enter role name"
            className="flex-1 px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <motion.button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Role
          </motion.button>
        </form>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex justify-between items-center p-4 bg-white bg-opacity-20 rounded-lg"
          >
            <span className="text-white">{role.name}</span>
            <motion.button
              onClick={() => handleDeleteRole(role.id)}
              className="text-red-500 hover:text-red-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Delete
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  )
}

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

export default function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [newCompany, setNewCompany] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('BSc IT')
  const [error, setError] = useState<string | null>(null)

  const courses = ['BSc IT', 'BMS', 'BMM']

  useEffect(() => {
    fetchCompanies()
  }, [selectedCourse])

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
      console.error('Error fetching companies:', error)
      setError('Failed to fetch companies')
    }
  }

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompany.trim()) {
      setError('Please enter a company name')
      return
    }

    try {
      await addDoc(collection(db, 'companies'), {
        name: newCompany.trim(),
        course: selectedCourse
      })
      setNewCompany('')
      setError(null)
      fetchCompanies()
    } catch (error) {
      console.error('Error adding company:', error)
      setError('Failed to add company')
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await deleteDoc(doc(db, 'companies', companyId))
      setError(null)
      fetchCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
      setError('Failed to delete company')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <label className="block text-sm font-medium text-white">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm text-gray-800"
        >
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleAddCompany} className="flex space-x-4">
        <input
          type="text"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          placeholder="Enter company name"
          className="flex-1 px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
        <motion.button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Company
        </motion.button>
      </form>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {companies.map((company) => (
          <div
            key={company.id}
            className="flex justify-between items-center p-4 bg-white bg-opacity-20 rounded-lg"
          >
            <span className="text-white">{company.name}</span>
            <motion.button
              onClick={() => handleDeleteCompany(company.id)}
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

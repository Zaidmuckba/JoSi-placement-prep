'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Evaluation() {
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [chances, setChances] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Simulate API call to get ATS score and chances
    setTimeout(() => {
      setAtsScore(Math.floor(Math.random() * 41) + 60) // Random score between 60 and 100
      setChances(['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)])
    }, 2000)
  }, [])

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.h1 
        className="text-4xl font-bold text-center text-white mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Evaluation Results
      </motion.h1>
      <div className="max-w-md mx-auto bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">ATS Score</h2>
          {atsScore !== null ? (
            <div className="text-6xl font-bold text-center text-white">{atsScore}</div>
          ) : (
            <div className="text-center text-white">Calculating...</div>
          )}
        </motion.div>
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Chances for Selected Role</h2>
          {chances !== null ? (
            <div className="text-4xl font-bold text-center text-white">{chances}</div>
          ) : (
            <div className="text-center text-white">Evaluating...</div>
          )}
        </motion.div>
        <motion.button 
          onClick={() => router.push('/')}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Over
        </motion.button>
        <motion.button 
          onClick={() => router.push('/interview-prep')}
          className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Proceed to Interview Preparation
        </motion.button>
      </div>
    </div>
  )
}


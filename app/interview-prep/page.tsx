'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaRobot } from 'react-icons/fa'

export default function InterviewPrep() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-4xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center text-white mb-12">
          Interview Preparation
        </h1>
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-lg"
          >
            <a href="https://sites.google.com/view/sxcplacementcell/home" target="_blank" rel="noopener noreferrer">
              <div className="bg-white bg-opacity-10 rounded-lg p-8 text-center text-white hover:bg-opacity-20 transition-all duration-300">
                <FaRobot className="text-5xl mb-4 mx-auto" />
                <h2 className="text-2xl font-bold mb-4">JoSi Chatbot</h2>
                <p>Get personalized interview preparation assistance with our advanced AI chatbot.</p>
              </div>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}


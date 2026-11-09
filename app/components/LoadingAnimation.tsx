'use client'

import { motion } from 'framer-motion'

export function LoadingAnimation() {
  const letters = ['J', 'o', 'S', 'i']

  return (
    <div className="flex justify-center items-center h-screen">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="text-6xl font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 1, 0],
            y: [20, 0, 20],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            },
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  )
}


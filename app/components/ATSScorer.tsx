'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Suggestion {
  original: string;
  suggested: string;
  type: 'content' | 'grammar';
}

interface ATSScorerProps {
  resumeText: string;
}

export function ATSScorer({ resumeText }: ATSScorerProps) {
  const [score, setScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Simulate ML model analysis
    const analyzeResume = async () => {
      // In a real-world scenario, you would call an API here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Generate a random score between 60 and 100
      const generatedScore = Math.floor(Math.random() * 41) + 60;

      // Generate some sample suggestions
      const generatedSuggestions: Suggestion[] = [
        {
          original: "Responsible for managing team projects",
          suggested: "Led cross-functional team projects, resulting in 20% increase in productivity",
          type: 'content'
        },
        {
          original: "Worked on various software development projects",
          suggested: "Developed and deployed 5 full-stack applications using React and Node.js",
          type: 'content'
        },
        {
          original: "Good communication skills",
          suggested: "Excellent communication skills, regularly presenting project updates to stakeholders",
          type: 'content'
        },
        {
          original: "I done multiple projects",
          suggested: "I have completed multiple projects",
          type: 'grammar'
        },
      ];

      setScore(generatedScore);
      setSuggestions(generatedSuggestions);
    };

    analyzeResume();
  }, [resumeText]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">ATS Score</h2>
        {score !== null ? (
          <div className="text-4xl font-bold text-white">{score}</div>
        ) : (
          <div className="text-white">Analyzing...</div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Suggestions</h2>
        {suggestions.length > 0 ? (
          <ul className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                className="bg-white bg-opacity-10 p-4 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <p className="text-red-300 line-through mb-2">{suggestion.original}</p>
                <p className="text-green-300">{suggestion.suggested}</p>
                <span className="text-xs text-white mt-2 inline-block bg-purple-600 px-2 py-1 rounded">
                  {suggestion.type === 'content' ? 'Content Improvement' : 'Grammar Correction'}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-white">Generating suggestions...</div>
        )}
      </motion.div>
    </div>
  );
}


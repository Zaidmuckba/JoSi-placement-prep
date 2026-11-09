'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaMicrophone, FaStop } from 'react-icons/fa'
import { QuestionService, Question } from '../../services/questionService'
import { useUser } from '../../contexts/UserContext'

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface LocalQuestion extends Omit<Question, 'id'> {
  id: number;
}

export default function AIInterview() {
  const { user } = useUser()
  const [questions, setQuestions] = useState<LocalQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [chances, setChances] = useState<number | null>(null)
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      if (!user) return;
      
      const questionService = QuestionService.getInstance();
      const fetchedQuestions = await questionService.getQuestionsForUser(user.uid, 'speech');
      // Convert string IDs to numbers for local use
      const localQuestions: LocalQuestion[] = fetchedQuestions.map((q, index) => ({
        ...q,
        id: index + 1
      }));
      setQuestions(localQuestions);
    };

    loadQuestions();

    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setTranscript(transcript)
      }
    }
  }, [])

  const startListening = () => {
    setIsListening(true)
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopListening = async () => {
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Simulate API call to evaluate answer
    await new Promise(resolve => setTimeout(resolve, 1000))

    const generatedFeedback = "Your answer demonstrates good understanding. Consider providing more specific examples to strengthen your response."
    setFeedback(generatedFeedback)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
      setTranscript('')
      setFeedback(null)
    } else {
      const generatedChances = Math.floor(Math.random() * 31) + 70 // Random number between 70 and 100
      setChances(generatedChances)
      setIsInterviewComplete(true)
    }
  }

  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      speakQuestion(questions[currentQuestionIndex].text)
    }
  }, [questions, currentQuestionIndex])

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.h1 
        className="text-4xl font-bold text-center text-white mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        AI Interview
      </motion.h1>
      <div className="max-w-3xl mx-auto space-y-8">
        {!isInterviewComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">{questions[currentQuestionIndex]?.text}</h2>
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={startListening}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isListening}
              >
                <FaMicrophone className="mr-2" /> Start Speaking
              </motion.button>
              <motion.button
                onClick={stopListening}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!isListening}
              >
                <FaStop className="mr-2" /> Stop Speaking
              </motion.button>
            </div>
            {transcript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4 p-4 bg-white bg-opacity-10 rounded-lg"
              >
                <h3 className="font-bold text-white mb-2">Your Answer:</h3>
                <p className="text-white">{transcript}</p>
              </motion.div>
            )}
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4 p-4 bg-green-500 bg-opacity-20 rounded-lg"
              >
                <h3 className="font-bold text-white mb-2">Feedback:</h3>
                <p className="text-white">{feedback}</p>
              </motion.div>
            )}
          </motion.div>
        )}
        {isInterviewComplete && chances !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Interview Complete</h2>
            <p className="text-xl text-white mb-8">Your estimated chances of success based on this interview:</p>
            <div className="text-6xl font-bold text-white">{chances}%</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

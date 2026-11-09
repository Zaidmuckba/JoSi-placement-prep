'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { ProgressBar } from '../components/ProgressBar'
import { useUser } from '../contexts/UserContext'
import ResumeAnalysisResults from '../components/ResumeAnalysisResults'
import { addResumeSubmission } from '../lib/db/resume'
import type { ResumeSubmission } from '../types/resume'

export default function ResumePage() {
  const [resume, setResume] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()
  const { user } = useUser()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const fileType = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileType || !['pdf', 'docx'].includes(fileType)) {
        setSubmitError('Please upload a PDF or DOCX file')
        return
      }
      
      setResume(file)
      setSubmitError(null)
      setErrorDetails(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setErrorDetails(null)
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      if (!resume || !jobDescription) {
        throw new Error('Please provide both resume and job description')
      }

      const formData = new FormData()
      formData.append('resume', resume)
      formData.append('jobDescription', jobDescription)

      const response = await fetch('/api/resume-analysis', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze resume')
      }

      if (!result.data) {
        throw new Error('Invalid response from server')
      }

      setAnalysisResult(result.data)

      await addResumeSubmission({
        submittedAt: new Date().toISOString(),
        percentMatch: result.data.percentMatch,
        keywordMatches: result.data.skillsAnalysis.technical,
        suggestions: result.data.suggestions,
        jobDescription,
        analysis: result.data
      })
    } catch (error) {
      console.error('Error submitting resume:', error)
      if (error instanceof Error) {
        setSubmitError(error.message)
        if ('details' in error) {
          setErrorDetails((error as any).details)
        }
      } else {
        setSubmitError('Failed to submit resume')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSkip = () => {
    router.push('/interview-prep')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressBar currentStep={5} totalSteps={5} />
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Submit Your Resume
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50 bg-opacity-10' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {resume ? (
              <div className="text-green-400">
                <p>Selected file: {resume.name}</p>
                <p className="text-sm text-gray-400">Click or drag to replace</p>
              </div>
            ) : isDragActive ? (
              <p>Drop your resume here...</p>
            ) : (
              <div>
                <p>Drag & drop your resume here, or click to select</p>
                <p className="text-sm text-gray-400 mt-2">Supported formats: PDF, DOCX</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-white">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              required
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-50 border border-transparent rounded-md text-sm shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Paste the job description here..."
            />
          </div>

          {submitError && (
            <motion.div
              className="mt-4 p-4 bg-red-500 bg-opacity-20 rounded-lg text-red-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>{submitError}</p>
              {errorDetails && (
                <p className="text-sm text-red-500 mt-2">{errorDetails}</p>
              )}
            </motion.div>
          )}

          <div className="flex space-x-4">
            <motion.button
              type="submit"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Submit'
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip
            </motion.button>
          </div>
        </form>

        {/* Analysis Results */}
        {analysisResult && <ResumeAnalysisResults analysis={analysisResult} />}
      </motion.div>
    </div>
  )
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { generatePDFReport } from '../services/reportGenerator';
import { ResumeAnalysisResult } from '../types/analysis';

interface ResumeAnalysisResultsProps {
  analysis: ResumeAnalysisResult;
}

const ResumeAnalysisResults: React.FC<ResumeAnalysisResultsProps> = ({ analysis }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Categorize the match score based on defined rules
  const getMatchCategory = (score: number): { category: string; color: string } => {
    if (score >= 80) {
      return { category: 'Excellent', color: 'green' };
    } else if (score >= 60) {
      return { category: 'Good', color: 'yellow' };
    } else {
      return { category: 'Needs Improvement', color: 'red' };
    }
  };

  const matchCategory = getMatchCategory(analysis.percentMatch);

  // Prepare data for the Radar Chart
  const radarData = [
    {
      category: 'Readability',
      score: analysis.detailedAnalysis.readability * 100,
      fullMark: 100,
    },
    {
      category: 'Format',
      score: analysis.detailedAnalysis.formatScore * 100,
      fullMark: 100,
    },
    {
      category: 'Keywords',
      score: analysis.detailedAnalysis.keywordScore * 100,
      fullMark: 100,
    },
    {
      category: 'Relevance',
      score: analysis.detailedAnalysis.relevanceScore * 100,
      fullMark: 100,
    },
    {
      category: 'Length',
      score: analysis.detailedAnalysis.lengthScore * 100,
      fullMark: 100,
    },
  ];

  // Prepare data for the Skills Distribution Bar Chart
  const skillsData = [
    {
      name: 'Technical Skills',
      present: analysis.skillsAnalysis.technical.length,
      missing: analysis.skillsAnalysis.missing.filter(skill => analysis.skillsAnalysis.technical.includes(skill)).length,
      total: analysis.skillsAnalysis.technical.length + analysis.skillsAnalysis.missing.filter(skill => analysis.skillsAnalysis.technical.includes(skill)).length,
    },
    {
      name: 'Soft Skills',
      present: analysis.skillsAnalysis.soft.length,
      missing: analysis.skillsAnalysis.missing.filter(skill => analysis.skillsAnalysis.soft.includes(skill)).length,
      total: analysis.skillsAnalysis.soft.length + analysis.skillsAnalysis.missing.filter(skill => analysis.skillsAnalysis.soft.includes(skill)).length,
    },
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const reportData = {
        percentMatch: analysis.percentMatch,
        skillsAnalysis: {
          technical: analysis.skillsAnalysis.technical,
          soft: analysis.skillsAnalysis.soft,
          missing: analysis.skillsAnalysis.missing,
        },
        sectionAnalysis: analysis.sectionAnalysis,
        suggestions: analysis.suggestions,
      };

      const blob = await generatePDFReport(reportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume-analysis.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Detect if the resume is a sample and display a prompt
  if (analysis.isSample) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-full"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg text-center">
          <strong className="font-bold">Sample Resume Detected!</strong>
          <span className="block sm:inline"> Please upload a real resume for analysis.</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto px-4 py-8"
    >
      {/* AI Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg shadow-sm"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">AI-Generated Analysis Disclaimer</h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>This analysis is generated by artificial intelligence and should be used as a guideline only. While we strive for accuracy, please use your judgment and verify important details. The suggestions provided are recommendations and may not apply to all situations.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Match Score */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Match Score</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700">Overall Match: {analysis.percentMatch}%</span>
          <span
            className={`px-3 py-1 rounded-full text-white font-semibold ${matchCategory.color === 'green'
              ? 'bg-green-500'
              : matchCategory.color === 'yellow'
                ? 'bg-yellow-500'
                : 'bg-red-500'
              }`}
          >
            {matchCategory.category}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${matchCategory.color === 'green'
              ? 'bg-green-500'
              : matchCategory.color === 'yellow'
                ? 'bg-yellow-500'
                : 'bg-red-500'
              }`}
            style={{ width: `${analysis.percentMatch}%` }}
          ></div>
        </div>
      </motion.div>

      {/* Skills Analysis */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Skills Analysis</h2>
        <div className="space-y-6">
          {/* Technical Skills */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Technical Skills Found:</h3>
            {analysis.skillsAnalysis.technical.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysis.skillsAnalysis.technical.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No technical skills found.</p>
            )}
          </div>

          {/* Soft Skills */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Soft Skills Found:</h3>
            {analysis.skillsAnalysis.soft.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysis.skillsAnalysis.soft.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No soft skills found.</p>
            )}
          </div>

          {/* Missing Skills */}
          {analysis.skillsAnalysis.missing.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Missing Skills:</h3>
              <div className="flex flex-wrap gap-3">
                {analysis.skillsAnalysis.missing.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="space-y-8">
        {/* Radar Chart */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Analysis Breakdown</h3>
            <p className="text-gray-600">
              This radar chart shows how your resume performs across five key dimensions. Each axis represents a score out of 100:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li><span className="font-semibold">Readability:</span> How clear and well-written your resume is</li>
              <li><span className="font-semibold">Format:</span> How well-structured and organized your resume is</li>
              <li><span className="font-semibold">Keywords:</span> How well your skills match the job requirements</li>
              <li><span className="font-semibold">Relevance:</span> How closely your experience aligns with the role</li>
              <li><span className="font-semibold">Length:</span> Whether your resume has an appropriate amount of content</li>
            </ul>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: '#4B5563', fontSize: 14, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: '#4B5563' }}
                  angle={30}
                  tickCount={5}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#60A5FA"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`${Math.round(value)}%`, 'Score']}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Skills Distribution</h3>
            <p className="text-gray-600">
              This chart shows the distribution of technical and soft skills in your resume compared to the job requirements:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li><span className="font-semibold">Present:</span> Skills found in your resume</li>
              <li><span className="font-semibold">Missing:</span> Required skills that were not found</li>
              <li><span className="font-semibold">Total:</span> Total number of skills required for the position</li>
            </ul>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={skillsData}
                margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                barGap={0}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#4B5563', fontSize: 14 }}
                  padding={{ left: 30, right: 30 }}
                />
                <YAxis
                  tick={{ fill: '#4B5563' }}
                  allowDecimals={false}
                  label={{ 
                    value: 'Number of Skills',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#4B5563' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    const labels = {
                      present: 'Skills Present',
                      missing: 'Skills Missing',
                      total: 'Total Required'
                    };
                    return labels[value] || value;
                  }}
                />
                <Bar name="present" dataKey="present" fill="#22C55E" />
                <Bar name="missing" dataKey="missing" fill="#EF4444" />
                <Bar name="total" dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Tip:</span> Focus on acquiring or highlighting the missing skills to improve your match with the job requirements.
              The closer your "Present" bar is to the "Total" bar, the better your skills match the position.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8 mt-8 hover:shadow-xl transition-shadow duration-300"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Improvement Suggestions</h3>
        <div className="space-y-6">
          {analysis.suggestions.map((suggestion, index) => {
            // Check if this is a main category (not starting with bullet point)
            if (!suggestion.startsWith('•')) {
              // Add extra spacing before new categories except the first one
              const topSpacing = index === 0 ? '' : 'mt-8';
              return (
                <div key={index} className={topSpacing}>
                  <h4 className="text-lg font-semibold text-blue-600 mb-3">
                    {suggestion.replace(':', '')}
                  </h4>
                  {/* If this is the last item or the next item doesn't start with bullet, add a message */}
                  {(index === analysis.suggestions.length - 1 || !analysis.suggestions[index + 1]?.startsWith('•')) && (
                    <p className="text-gray-600 italic mt-2">No specific suggestions in this category</p>
                  )}
                </div>
              );
            } else {
              // This is a bullet point item
              return (
                <div key={index} className="ml-6 text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{suggestion.replace('•', '').trim()}</span>
                </div>
              );
            }
          })}
        </div>
        
        {analysis.suggestions.length === 0 && (
          <p className="text-gray-600 italic">
            Great job! Your resume looks well-optimized for this position. Keep it updated with your latest achievements.
          </p>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-700 mb-2">How to Use These Suggestions</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Focus on implementing the suggestions in order of importance</li>
            <li>Each bullet point represents a specific action you can take to improve your resume</li>
            <li>Pay special attention to suggestions about missing skills and experience</li>
            <li>Use the formatting suggestions to make your resume more readable</li>
          </ul>
        </div>
      </motion.div>

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:shadow-lg transform transition-all duration-200 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {isDownloading ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ResumeAnalysisResults;

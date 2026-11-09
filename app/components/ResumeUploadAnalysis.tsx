'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ResumeAnalyzer } from '../services/resumeAnalysis';
import ExtractedTextConfirmation from './ExtractedTextConfirmation';
import ResumeAnalysisResults from './ResumeAnalysisResults';
import { ResumeAnalysisResult } from '../types/analysis';

interface ResumeUploadAnalysisProps {
  jobDescription: string;
}

enum AnalysisStep {
  UPLOAD,
  CONFIRM_TEXT,
  ANALYSIS_RESULTS
}

const ResumeUploadAnalysis: React.FC<ResumeUploadAnalysisProps> = ({ jobDescription }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<ResumeAnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>(AnalysisStep.UPLOAD);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setError('No file was uploaded.');
      return;
    }

    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (!fileType || !['pdf', 'docx'].includes(fileType)) {
      setError(`Unsupported file type: ${fileType}. Please upload a PDF or DOCX file.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { text, isSample } = await ResumeAnalyzer.extractResumeText(arrayBuffer, fileType);

      if (isSample) {
        // If it's a sample resume, inform the user and reset the state
        setError('The uploaded resume appears to be a sample. Please upload a real resume for analysis.');
        setCurrentStep(AnalysisStep.UPLOAD);
        setExtractedText(null);
      } else if (text && text.trim().length >= 100) {
        setExtractedText(text);
        setOpenDialog(true);
        setCurrentStep(AnalysisStep.CONFIRM_TEXT);
      } else {
        throw new Error('No sufficient text could be extracted from the resume.');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to process the file.');
      setCurrentStep(AnalysisStep.UPLOAD);
      setExtractedText(null);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    maxSize: 10485760 // 10MB
  });

  const handleConfirm = async (confirmedText: string) => {
    setLoading(true);
    setError(null);
    setOpenDialog(false);

    try {
      const results = await ResumeAnalyzer.analyzeConfirmedResume(confirmedText, jobDescription);
      setAnalysisResults(results);
      setCurrentStep(AnalysisStep.ANALYSIS_RESULTS);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume.');
      setCurrentStep(AnalysisStep.UPLOAD);
      setAnalysisResults(null);
    } finally {
      setLoading(false);
      setExtractedText(null);
    }
  };

  const handleCancel = () => {
    setExtractedText(null);
    setError(null);
    setOpenDialog(false);
    setCurrentStep(AnalysisStep.UPLOAD);
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setExtractedText(null);
    setError(null);
    setCurrentStep(AnalysisStep.UPLOAD);
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Upload Step */}
      {currentStep === AnalysisStep.UPLOAD && (
        <Paper
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 5,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
            transition: 'background-color 0.3s',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography variant="h6" color="primary">
              Drop the resume file here...
            </Typography>
          ) : (
            <Typography variant="h6">
              Drag and drop a resume file here, or click to select a file
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            (Supported formats: PDF, DOCX | Max size: 10MB)
          </Typography>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog && currentStep === AnalysisStep.CONFIRM_TEXT}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Confirm Extracted Text</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {extractedText}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleConfirm(extractedText || '')} variant="contained" color="primary">
            Confirm and Analyze
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Results Step */}
      {currentStep === AnalysisStep.ANALYSIS_RESULTS && analysisResults && (
        <Box>
          <Button variant="outlined" onClick={resetAnalysis} sx={{ mb: 3 }}>
            Analyze Another Resume
          </Button>
          <ResumeAnalysisResults analysis={analysisResults} />
        </Box>
      )}
    </Box>
  );
};

export default ResumeUploadAnalysis;

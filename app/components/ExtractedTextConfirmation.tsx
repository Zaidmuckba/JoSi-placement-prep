import React from 'react';
import { Button, Paper, Typography, Box } from '@mui/material';

interface ExtractedTextConfirmationProps {
  extractedText: string;
  onConfirm: (confirmedText: string) => void;
  onCancel: () => void;
}

const ExtractedTextConfirmation: React.FC<ExtractedTextConfirmationProps> = ({
  extractedText,
  onConfirm,
  onCancel,
}) => {
  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: '20px auto' }}>
      <Typography variant="h6" gutterBottom>
        Please review the extracted text
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Review the extracted text below and confirm if it's correct. The text will be used for analysis after confirmation.
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mt: 2, 
          mb: 2, 
          maxHeight: '400px', 
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {extractedText}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => onConfirm(extractedText)}
        >
          Confirm & Analyze
        </Button>
      </Box>
    </Box>
  );
};

export default ExtractedTextConfirmation;

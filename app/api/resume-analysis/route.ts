import { NextRequest, NextResponse } from 'next/server';
import { ResumeAnalyzer } from '../../services/resumeAnalysis';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume file and job description are required' },
        { status: 400 }
      );
    }

    // Get file extension and validate
    const fileName = resumeFile.name.toLowerCase();
    const fileType = fileName.split('.').pop();

    if (!fileType || !['pdf', 'docx'].includes(fileType)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Please upload a PDF or DOCX file.',
          details: `File type "${fileType}" is not supported. Supported types are: PDF, DOCX`
        },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    
    console.log(`Processing ${fileName} (${fileType}) of size ${arrayBuffer.byteLength} bytes`);
    
    const analysis = await ResumeAnalyzer.analyzeResume(arrayBuffer, fileType, jobDescription);

    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error('Resume analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze resume';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

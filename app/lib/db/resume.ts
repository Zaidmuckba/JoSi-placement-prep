import { ResumeSubmission } from '../../types/resume';

export async function addResumeSubmission(submission: Omit<ResumeSubmission, 'id'>): Promise<ResumeSubmission> {
  // Add your database logic here
  // For now, we'll just return the submission with a mock ID
  return {
    ...submission,
    id: Math.random().toString(36).substring(7)
  };
}

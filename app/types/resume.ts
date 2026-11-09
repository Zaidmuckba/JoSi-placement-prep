export interface ResumeSubmission {
  id?: string;
  submittedAt: string;
  percentMatch: number;
  keywordMatches: string[];
  suggestions: string[];
  jobDescription: string;
  analysis: any;
}

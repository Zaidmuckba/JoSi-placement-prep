export interface ResumeAnalysisResult {
  text: string;
  percentMatch: number;
  readabilityScore: number;
  keywordMatches: { [key: string]: number };
  missingKeywords: string[];
  suggestions: string[];
  detailedAnalysis: {
    readability: number;
    lengthScore: number;
    formatScore: number;
    keywordScore: number;
    relevanceScore: number;
    sectionScores: { [key: string]: number };
  };
  sectionAnalysis: {
    [key: string]: {
      found: boolean;
      content: string;
      suggestions: string[];
    };
  };
  skillsAnalysis: {
    technical: string[];
    soft: string[];
    missing: string[];
  };
  industryMatch: {
    score: number;
    relevantExperience: string[];
    suggestedImprovements: string[];
  };
}

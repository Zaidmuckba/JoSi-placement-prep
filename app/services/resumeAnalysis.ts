import * as mammoth from 'mammoth';
import * as natural from 'natural';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import nlp from 'compromise';
import { ResumeAnalysisResult } from '../types/analysis';

// Set the workerSrc property for pdfjsLib
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${require('pdfjs-dist/package.json').version}/pdf.worker.js`;

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Utility function to calculate cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * (vecB[idx] || 0), 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export class ResumeAnalyzer {
  // Define lists of common skills across various fields
  private static readonly skillCategories = {
    medical: new Set([
      'patient care', 'clinical research', 'diagnostics', 'medical records', 'patient assessment',
      'vital signs', 'medical terminology', 'infection control', 'pharmacology', 'pathology',
      'anatomy', 'physiology', 'emergency medicine', 'patient monitoring', 'medical imaging',
      'laboratory techniques', 'sterilization', 'vaccination', 'wound care', 'medical ethics'
    ]),

    healthcare: new Set([
      'healthcare management', 'medical billing', 'electronic health records', 'hipaa compliance',
      'patient scheduling', 'medical coding', 'healthcare administration', 'insurance verification',
      'medical office management', 'telehealth', 'patient education', 'clinical documentation',
      'medical transcription', 'healthcare coordination', 'quality assurance'
    ]),

    business: new Set([
      'marketing', 'sales', 'business development', 'market research', 'strategic planning',
      'financial analysis', 'budgeting', 'project management', 'business strategy', 'operations management',
      'risk management', 'supply chain', 'customer relationship management', 'business intelligence',
      'brand management', 'digital marketing', 'social media marketing', 'market analysis'
    ]),

    finance: new Set([
      'financial planning', 'investment analysis', 'portfolio management', 'risk assessment',
      'financial reporting', 'accounting', 'taxation', 'auditing', 'financial modeling',
      'banking', 'insurance', 'wealth management', 'credit analysis', 'corporate finance',
      'financial statements', 'cost analysis', 'forecasting', 'business valuation'
    ]),

    education: new Set([
      'curriculum development', 'lesson planning', 'student assessment', 'classroom management',
      'educational technology', 'special education', 'teaching methods', 'instructional design',
      'student counseling', 'educational leadership', 'distance learning', 'student engagement',
      'academic advising', 'educational psychology', 'learning assessment'
    ]),

    engineering: new Set([
      'mechanical design', 'electrical systems', 'civil engineering', 'structural analysis',
      'autocad', 'solidworks', 'product development', 'quality control', 'manufacturing processes',
      'industrial design', 'robotics', '3d modeling', 'circuit design', 'thermodynamics',
      'materials science', 'process optimization', 'engineering analysis'
    ]),

    technology: new Set([
      'javascript', 'python', 'java', 'c#', 'react', 'node.js', 'angular', 'sql', 'nosql',
      'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'ruby', 'swift', 'machine learning',
      'data analysis', 'cloud computing', 'cybersecurity', 'network administration',
      'system architecture', 'database management', 'artificial intelligence'
    ]),

    media: new Set([
      'content creation', 'video production', 'photography', 'graphic design', 'social media',
      'digital marketing', 'public relations', 'journalism', 'broadcasting', 'copywriting',
      'content strategy', 'media planning', 'brand development', 'advertising', 'editorial',
      'visual storytelling', 'multimedia production', 'content management'
    ]),

    research: new Set([
      'data analysis', 'research methodology', 'statistical analysis', 'experimental design',
      'literature review', 'qualitative research', 'quantitative research', 'data collection',
      'research ethics', 'survey design', 'clinical trials', 'laboratory research',
      'research documentation', 'grant writing', 'publication'
    ]),

    legal: new Set([
      'legal research', 'contract law', 'litigation', 'legal writing', 'case management',
      'regulatory compliance', 'intellectual property', 'corporate law', 'legal documentation',
      'legal analysis', 'negotiation', 'mediation', 'legal ethics', 'paralegal skills'
    ])
  };

  private static readonly softSkills: Set<string> = new Set([
    'communication', 'leadership', 'teamwork', 'problem-solving', 'critical thinking',
    'time management', 'adaptability', 'creativity', 'organization', 'interpersonal skills',
    'collaboration', 'decision making', 'conflict resolution', 'attention to detail',
    'initiative', 'work ethic', 'emotional intelligence', 'cultural awareness',
    'stress management', 'mentoring', 'negotiation', 'presentation skills',
    'analytical thinking', 'customer service', 'project coordination', 'multitasking',
    'team building', 'strategic thinking', 'verbal communication', 'written communication'
  ]);

  /**
   * Extracts text from a resume file (PDF or DOCX).
   * @param file ArrayBuffer of the resume file.
   * @param fileType Type of the file ('pdf' or 'docx').
   * @returns Extracted text as a string.
   */
  private static async extractText(file: ArrayBuffer, fileType: string): Promise<string> {
    console.log('Starting text extraction for file type:', fileType);
    console.log('File size:', file.byteLength, 'bytes');

    try {
      if (fileType.toLowerCase() === 'pdf') {
        console.log('Processing PDF file...');
        const pdf: PDFDocumentProxy = await getDocument({ data: file }).promise;
        console.log('PDF loaded successfully. Number of pages:', pdf.numPages);

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          console.log(`Processing page ${i} of ${pdf.numPages}`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          text += pageText + '\n';
          console.log(`Page ${i} extracted text length:`, pageText.length);
        }

        if (!text.trim()) {
          throw new Error('No text content extracted from PDF');
        }

        console.log('Total extracted text length:', text.length);
        return text;

      } else if (fileType.toLowerCase() === 'docx') {
        console.log('Processing DOCX file...');
        try {
          const buffer = Buffer.from(file);
          console.log('Buffer created successfully. Size:', buffer.length);

          const result = await mammoth.extractRawText({ buffer });
          console.log('Mammoth extraction completed');

          if (!result.value) {
            throw new Error('No text content found in DOCX file');
          }

          if (!result.value.trim()) {
            throw new Error('Extracted text is empty from DOCX');
          }

          console.log('Extracted text length:', result.value.length);
          return result.value;

        } catch (docxError: any) {
          console.error('DOCX extraction error details:', docxError);
          throw new Error(`Failed to extract text from DOCX: ${docxError.message}`);
        }
      } else {
        throw new Error(`Unsupported file type: ${fileType}. Only PDF and DOCX are supported.`);
      }
    } catch (error: any) {
      console.error('Text extraction error details:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Calculates the Flesch Reading Ease score of the text.
   * @param text Input text.
   * @returns Readability score normalized between 0 and 1.
   */
  private static calculateReadabilityScore(text: string): number {
    try {
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const sentences = text.split(/[.!?]+/).filter(sentence => sentence.length > 0);
      const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

      if (words.length === 0 || sentences.length === 0) return 0;

      // Flesch Reading Ease formula
      const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
      return Math.max(0, Math.min(100, score)) / 100;
    } catch (error) {
      console.error('Readability calculation error:', error);
      return 0;
    }
  }

  /**
   * Counts the number of syllables in a word.
   * @param word Input word.
   * @returns Number of syllables.
   */
  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  /**
   * Analyzes the sections present in the resume.
   * @param text Extracted resume text.
   * @returns Object containing section analysis.
   */
  private static analyzeSections(text: string) {
    const sections = {
      education: {
        found: false,
        content: '',
        suggestions: []
      },
      experience: {
        found: false,
        content: '',
        suggestions: []
      },
      skills: {
        found: false,
        content: '',
        suggestions: []
      },
      projects: {
        found: false,
        content: '',
        suggestions: []
      },
      certifications: {
        found: false,
        content: '',
        suggestions: []
      },
      awards: {
        found: false,
        content: '',
        suggestions: []
      },
      summary: {
        found: false,
        content: '',
        suggestions: []
      }
    };

    const sectionPatterns: { [key: string]: RegExp } = {
      education: /education|academic background|degrees/i,
      experience: /experience|work history|professional background|employment history/i,
      skills: /skills|technologies|technical skills|soft skills|areas of expertise/i,
      projects: /projects|portfolio|work samples|notable projects/i,
      certifications: /certifications|licenses|credentials/i,
      awards: /awards|honors|achievements/i,
      summary: /summary|professional summary|career objective|profile/i
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check if the line matches any section header
      let sectionMatched = false;
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(trimmedLine)) {
          currentSection = section;
          sections[section].found = true;
          sectionMatched = true;
          break;
        }
      }

      if (sectionMatched) {
        continue; // Move to the next line after setting the current section
      }

      // Accumulate content for the current section
      if (currentSection && !sectionPatterns[currentSection].test(trimmedLine)) {
        sections[currentSection].content += trimmedLine + '\n';
      }
    }

    // Generate suggestions for missing sections
    Object.entries(sections).forEach(([section, analysis]) => {
      if (!analysis.found) {
        switch (section) {
          case 'education':
            analysis.suggestions.push('Add an Education section to highlight your academic background.');
            break;
          case 'experience':
            analysis.suggestions.push('Include a Work Experience section to showcase your professional history.');
            break;
          case 'skills':
            analysis.suggestions.push('Add a Skills section to highlight your technical and soft skills.');
            break;
          case 'projects':
            analysis.suggestions.push('Consider adding a Projects section to demonstrate practical experience.');
            break;
          case 'certifications':
            analysis.suggestions.push('Include a Certifications section to display relevant credentials.');
            break;
          case 'awards':
            analysis.suggestions.push('Add an Awards section to showcase your achievements.');
            break;
          case 'summary':
            analysis.suggestions.push('Include a Summary section to provide an overview of your professional profile.');
            break;
        }
      }
    });

    return sections;
  }

  /**
   * Detects if the resume is a sample or template based on common placeholders or patterns.
   * @param text Extracted resume text.
   * @returns Boolean indicating if the resume is a sample.
   */
  private static isSampleResume(text: string): boolean {
    const samplePatterns = [
      /your name here/i,
      /john doe/i,
      /jane doe/i,
      /contact information/i,
      /address: your address/i,
      /email: your.email@domain.com/i,
      /phone: \d{3}-\d{3}-\d{4}/i,
      /objective statement/i,
      /summary of qualifications/i,
      /work experience goes here/i
    ];

    return samplePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Extracts skills from text using an improved algorithm that considers multiple fields
   */
  private static extractSkills(text: string, jobDescription: string = ''): { technical: Set<string>; soft: Set<string> } {
    const technical = new Set<string>();
    const soft = new Set<string>();
    
    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    const lowerJobDesc = jobDescription.toLowerCase();
    
    // Detect the most likely field(s) based on keyword frequency
    const fieldScores = new Map<string, number>();
    
    for (const [field, skills] of Object.entries(this.skillCategories)) {
      let score = 0;
      skills.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase()) || lowerJobDesc.includes(skill.toLowerCase())) {
          score++;
        }
      });
      fieldScores.set(field, score);
    }

    // Get the top 2-3 most relevant fields
    const sortedFields = Array.from(fieldScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([_, score]) => score > 0)
      .map(([field, _]) => field);

    // Extract technical skills from the most relevant fields
    sortedFields.forEach(field => {
      this.skillCategories[field].forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
          technical.add(skill);
        }
      });
    });

    // Extract soft skills
    this.softSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        soft.add(skill);
      }
    });

    // Use NLP for more complex matches and context
    const doc = nlp(text);
    const terms = doc.terms().out('array');

    // Process each term to find potential skills with context
    terms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      
      // Check in relevant fields
      sortedFields.forEach(field => {
        this.skillCategories[field].forEach(skill => {
          if (this.isSkillMatch(lowerTerm, skill.toLowerCase())) {
            technical.add(skill);
          }
        });
      });

      // Check soft skills
      this.softSkills.forEach(skill => {
        if (this.isSkillMatch(lowerTerm, skill.toLowerCase())) {
          soft.add(skill);
        }
      });
    });

    return { technical, soft };
  }

  /**
   * Improved skill matching that considers variations and context
   */
  private static isSkillMatch(term: string, skill: string): boolean {
    // Direct match
    if (term === skill) return true;
    
    // Part of a compound skill
    if (skill.includes(term) || term.includes(skill)) {
      // Avoid partial word matches (e.g., "car" shouldn't match "cardiac")
      const termWords = term.split(/\s+/);
      const skillWords = skill.split(/\s+/);
      
      return skillWords.some(skillWord => 
        termWords.some(termWord => 
          termWord === skillWord || 
          (termWord.length > 3 && skillWord.length > 3 && 
           (termWord.includes(skillWord) || skillWord.includes(termWord)))
        )
      );
    }
    
    return false;
  }

  /**
   * Analyzes the skills in the resume compared to the job description.
   * @param resumeText Extracted resume text.
   * @param jobDescription Job description text.
   * @returns Object containing technical skills, soft skills, and missing skills.
   */
  private static analyzeSkills(resumeText: string, jobDescription: string) {
    const resumeSkills = this.extractSkills(resumeText, jobDescription);
    const jobSkills = this.extractSkills(jobDescription);

    const missingSkills = new Set<string>();

    // Identify missing technical skills
    jobSkills.technical.forEach(skill => {
      if (!resumeSkills.technical.has(skill)) {
        missingSkills.add(skill);
      }
    });

    // Identify missing soft skills
    jobSkills.soft.forEach(skill => {
      if (!resumeSkills.soft.has(skill)) {
        missingSkills.add(skill);
      }
    });

    return {
      technical: Array.from(resumeSkills.technical),
      soft: Array.from(resumeSkills.soft),
      missing: Array.from(missingSkills)
    };
  }

  /**
   * Calculates the similarity between the resume and job description using TF-IDF and cosine similarity.
   * @param resumeText Extracted resume text.
   * @param jobDescription Job description text.
   * @returns Object containing similarity score and relevant experience sentences.
   */
  private static calculateIndustryMatch(resumeText: string, jobDescription: string) {
    if (!jobDescription || jobDescription.trim().length < 10) {
      throw new Error('Job description is too short or empty.');
    }

    const tfidf = new TfIdf();

    // Preprocess text to remove common noise
    const preprocessText = (text: string) => {
      return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    const processedResume = preprocessText(resumeText);
    const processedJob = preprocessText(jobDescription);

    tfidf.addDocument(processedResume);
    tfidf.addDocument(processedJob);

    // Extract unique terms from both documents
    const terms = new Set<string>();
    tfidf.documents.forEach(doc => {
      Object.keys(doc).forEach(term => terms.add(term));
    });

    const resumeVector = [];
    const jobVector = [];

    terms.forEach(term => {
      resumeVector.push(tfidf.tfidf(term, 0));
      jobVector.push(tfidf.tfidf(term, 1));
    });

    const similarity = cosineSimilarity(resumeVector, jobVector);

    // Extract relevant experience sentences
    const relevantExperience: string[] = [];
    const resumeSentences = resumeText.split(/[.!?]+/);
    const jobKeywords = new Set(
      jobDescription.toLowerCase()
        .split(/[\s,\.]+/)
        .filter(word => word.length > 3)
    );

    for (const sentence of resumeSentences) {
      const words = sentence.toLowerCase().split(/\W+/);
      const matchCount = words.filter(w => jobKeywords.has(w)).length;
      if (matchCount >= 2) {  // Sentence has at least 2 job-related keywords
        relevantExperience.push(sentence.trim());
      }
    }

    return {
      score: similarity,
      relevantExperience,
      suggestedImprovements: []
    };
  }

  /**
   * Calculates the final match percentage based on various weighted factors.
   * Implements specific score rules as per user request.
   * @param analysis Object containing different scores.
   * @returns Final match percentage between 0 and 100.
   */
  private static calculateFinalMatchPercentage(
    analysis: {
      readability: number;
      lengthScore: number;
      formatScore: number;
      keywordScore: number;
      relevanceScore: number;
    },
    resumeHash: string
  ): number {
    // Use the hash to generate consistent weights
    const hashNum = parseInt(resumeHash, 10);
    const baseWeights = {
      readability: 0.15,
      lengthScore: 0.10,
      formatScore: 0.15,
      keywordScore: 0.30,
      relevanceScore: 0.30
    };

    // Calculate weighted score
    const weightedScore = 
      (analysis.readability * baseWeights.readability) +
      (analysis.lengthScore * baseWeights.lengthScore) +
      (analysis.formatScore * baseWeights.formatScore) +
      (analysis.keywordScore * baseWeights.keywordScore) +
      (analysis.relevanceScore * baseWeights.relevanceScore);

    // Normalize to 0-100 range and round to nearest integer
    return Math.round(weightedScore * 100);
  }

  /**
   * Analyzes the length of the resume text.
   * @param text Extracted resume text.
   * @returns Length score (1 for optimal length, 0.5 otherwise).
   */
  private static analyzeLength(text: string): number {
    const length = text.length;
    return (length > 2000 && length < 8000) ? 1 : 0.5;
  }

  /**
   * Generates suggestions based on the analysis.
   * @param sections Section analysis.
   * @param skillsAnalysis Skills analysis.
   * @param industryMatch Industry match analysis.
   * @param readabilityScore Readability score.
   * @param jobDescription Job description text.
   * @returns Array of suggestion strings.
   */
  private static generateSuggestions(
    sections: any,
    skillsAnalysis: any,
    industryMatch: any,
    readabilityScore: number,
    jobDescription: string,
    resumeText: string
  ): string[] {
    const suggestions: string[] = [];
    const requirements = this.extractDetailedRequirements(jobDescription);
    const contentAnalysis = this.analyzeResumeContent(resumeText);

    // Professional Summary
    if (!sections.summary.found || sections.summary.content.length < 100) {
      suggestions.push('Professional Summary Recommendations');
      if (requirements.responsibilities.length > 0) {
        suggestions.push('• Include your experience with: ' + requirements.responsibilities[0].toLowerCase());
      }
      if (skillsAnalysis.technical.length > 0) {
        suggestions.push('• Highlight your expertise in: ' + skillsAnalysis.technical.slice(0, 3).join(', '));
      }
      suggestions.push('• Mention your years of experience and key achievements');
    }

    // Experience Section
    if (sections.experience.found) {
      const experienceSuggestions: string[] = [];
      
      if (!contentAnalysis.hasActionVerbs) {
        experienceSuggestions.push('• Begin each bullet point with strong action verbs (e.g., "Led," "Developed," "Implemented")');
      }
      if (!contentAnalysis.hasMetrics) {
        experienceSuggestions.push('• Add quantifiable achievements (e.g., "Increased efficiency by 25%," "Managed $500K budget")');
      }
      if (!contentAnalysis.hasDates) {
        experienceSuggestions.push('• Include clear start and end dates for each position');
      }
      
      if (experienceSuggestions.length > 0) {
        suggestions.push('Experience Section Enhancements');
        suggestions.push(...experienceSuggestions);
      }
    }

    // Skills Section
    if (skillsAnalysis.missing.length > 0) {
      const groupedSkills = this.groupSkillsByCategory(skillsAnalysis.missing);
      const relevantCategories = Object.entries(groupedSkills)
        .filter(([_, skills]) => skills.length > 0)
        .sort(([a], [b]) => a.localeCompare(b));

      if (relevantCategories.length > 0) {
        suggestions.push('Skills to Develop or Highlight');
        relevantCategories.forEach(([category, skills]) => {
          suggestions.push(`• ${category}: ${skills.join(', ')}`);
        });
      }
    }

    // Formatting and Readability
    const formattingSuggestions: string[] = [];
    
    if (readabilityScore < 0.7 || !contentAnalysis.hasProperFormatting) {
      if (contentAnalysis.averageBulletLength > 80) {
        formattingSuggestions.push('• Keep bullet points concise (1-2 lines each)');
      }
      if (!contentAnalysis.hasProperFormatting) {
        formattingSuggestions.push('• Use consistent spacing between sections (recommend 1-2 lines)');
        formattingSuggestions.push('• Maintain consistent font and formatting throughout');
      }
      formattingSuggestions.push('• Use bullet points instead of paragraphs for achievements');
    }
    
    if (formattingSuggestions.length > 0) {
      suggestions.push('Formatting Improvements');
      suggestions.push(...formattingSuggestions);
    }

    // Job Alignment
    if (industryMatch.score < 0.7 && requirements.responsibilities.length > 0) {
      suggestions.push('Job-Specific Enhancements');
      requirements.responsibilities.slice(0, 3).forEach(resp => {
        suggestions.push(`• Demonstrate your experience with: ${resp.toLowerCase()}`);
      });
    }

    return suggestions;
  }

  /**
   * Extracts specific requirements from job description with context
   */
  private static extractDetailedRequirements(jobDescription: string): { 
    experience: string[],
    education: string[],
    skills: string[],
    responsibilities: string[]
  } {
    const requirements = {
      experience: [] as string[],
      education: [] as string[],
      skills: [] as string[],
      responsibilities: [] as string[]
    };

    const lines = jobDescription.split('\n');
    let currentSection = '';

    const sectionPatterns = {
      experience: /experience|requirements|qualifications/i,
      education: /education|degree|academic/i,
      skills: /skills|competencies|proficiencies/i,
      responsibilities: /responsibilities|duties|role|job description/i
    };

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this line is a section header
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(trimmedLine)) {
          currentSection = section;
          break;
        }
      }

      // If line contains bullet point or number, it's likely a requirement
      if (/^[•\-\*\d\.]/.test(trimmedLine)) {
        const requirement = trimmedLine
          .replace(/^[•\-\*\d\.]+\s*/, '')
          .replace(/^(required|must have|should have|preferred):/i, '')
          .trim();

        if (requirement) {
          switch (currentSection) {
            case 'experience':
              requirements.experience.push(requirement);
              break;
            case 'education':
              requirements.education.push(requirement);
              break;
            case 'skills':
              requirements.skills.push(requirement);
              break;
            case 'responsibilities':
              requirements.responsibilities.push(requirement);
              break;
          }
        }
      }
    });

    return requirements;
  }

  /**
   * Analyzes resume content for specific improvements
   */
  private static analyzeResumeContent(text: string): {
    hasActionVerbs: boolean,
    hasMetrics: boolean,
    hasDates: boolean,
    hasLocations: boolean,
    averageBulletLength: number,
    hasProperFormatting: boolean
  } {
    const lines = text.split('\n');
    let bulletPoints = 0;
    let totalBulletLength = 0;
    
    const analysis = {
      hasActionVerbs: false,
      hasMetrics: false,
      hasDates: false,
      hasLocations: false,
      averageBulletLength: 0,
      hasProperFormatting: true
    };

    const actionVerbs = new Set([
      'achieved', 'improved', 'developed', 'managed', 'created', 'implemented',
      'increased', 'decreased', 'reduced', 'led', 'coordinated', 'supervised',
      'analyzed', 'designed', 'established', 'maintained', 'launched', 'executed'
    ]);

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check for bullet points
      if (/^[•\-\*]/.test(trimmedLine)) {
        bulletPoints++;
        totalBulletLength += trimmedLine.length;

        // Check for action verbs at start of bullet points
        const firstWord = trimmedLine.replace(/^[•\-\*]\s*/, '').split(/\s+/)[0].toLowerCase();
        if (actionVerbs.has(firstWord)) {
          analysis.hasActionVerbs = true;
        }
      }

      // Check for metrics
      if (/\d+%|\$\d+|\d+\s*(million|thousand|billion)|increased|decreased|reduced|improved by/i.test(trimmedLine)) {
        analysis.hasMetrics = true;
      }

      // Check for dates
      if (/\b(19|20)\d{2}\b|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?/i.test(trimmedLine)) {
        analysis.hasDates = true;
      }

      // Check for locations
      if (/\b[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b|\b[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+\b/.test(trimmedLine)) {
        analysis.hasLocations = true;
      }

      // Check formatting
      if (line.length > 100) {
        analysis.hasProperFormatting = false;
      }
    });

    analysis.averageBulletLength = bulletPoints > 0 ? totalBulletLength / bulletPoints : 0;

    return analysis;
  }

  /**
   * Group skills by their categories for better organization
   */
  private static groupSkillsByCategory(skills: string[]): { [key: string]: string[] } {
    const grouped: { [key: string]: string[] } = {};
    
    skills.forEach(skill => {
      let category = 'Other';
      
      // Find which category the skill belongs to
      for (const [cat, skillSet] of Object.entries(this.skillCategories)) {
        if (skillSet.has(skill.toLowerCase())) {
          category = cat.charAt(0).toUpperCase() + cat.slice(1);
          break;
        }
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    
    return grouped;
  }

  /**
   * First step: Extract text from resume for user confirmation
   */
  public static async extractResumeText(
    resumeFile: ArrayBuffer,
    fileType: string,
  ): Promise<{ text: string; isSample: boolean }> {
    try {
      const resumeText = await this.extractText(resumeFile, fileType);

      if (!resumeText || resumeText.trim().length < 100) {
        throw new Error('Unable to extract sufficient text from the resume.');
      }

      // Detect if the resume is a sample
      const isSample = this.isSampleResume(resumeText);
      if (isSample) {
        throw new Error('The uploaded resume appears to be a sample. Please upload a real resume.');
      }

      return { text: resumeText, isSample };
    } catch (error) {
      console.error('Error extracting resume text:', error);
      throw error;
    }
  }

  /**
   * Second step: Analyze the confirmed resume text
   */
  public static async analyzeConfirmedResume(
    confirmedText: string,
    jobDescription: string
  ): Promise<ResumeAnalysisResult> {
    try {
      // Calculate resume hash for consistent scoring
      const resumeHash = this.calculateResumeHash(confirmedText);
      
      // Analyze sections
      const sectionAnalysis = this.analyzeSections(confirmedText);

      // Analyze skills
      const skillsAnalysis = this.analyzeSkills(confirmedText, jobDescription);

      // Calculate industry match
      const industryMatch = this.calculateIndustryMatch(confirmedText, jobDescription);

      // Calculate readability score
      const readabilityScore = this.calculateReadabilityScore(confirmedText);

      // Calculate length score
      const lengthScore = this.analyzeLength(confirmedText);

      // Calculate format score (based on section organization)
      const formatScore = Object.values(sectionAnalysis).filter(s => s.found).length / Object.keys(sectionAnalysis).length;

      // Calculate keyword score
      const keywordScore = skillsAnalysis.technical.length / (skillsAnalysis.technical.length + skillsAnalysis.missing.length);

      // Calculate relevance score
      const relevanceScore = industryMatch.score;

      // Generate suggestions
      const suggestions = this.generateSuggestions(sectionAnalysis, skillsAnalysis, industryMatch, readabilityScore, jobDescription, confirmedText);

      // Calculate final match percentage using the hash for consistency
      const scores = {
        readability: readabilityScore,
        lengthScore,
        formatScore,
        keywordScore,
        relevanceScore
      };
      
      const percentMatch = this.calculateFinalMatchPercentage(scores, resumeHash);

      return {
        text: confirmedText,
        percentMatch,
        readabilityScore,
        keywordMatches: {},
        missingKeywords: skillsAnalysis.missing,
        suggestions,
        detailedAnalysis: {
          readability: readabilityScore,
          lengthScore,
          formatScore,
          keywordScore,
          relevanceScore,
          sectionScores: {}
        },
        sectionAnalysis,
        skillsAnalysis: {
          technical: Array.from(skillsAnalysis.technical),
          soft: Array.from(skillsAnalysis.soft),
          missing: Array.from(skillsAnalysis.missing)
        },
        industryMatch: {
          score: industryMatch.score,
          relevantExperience: industryMatch.relevantExperience,
          suggestedImprovements: industryMatch.suggestedImprovements
        }
      };
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error;
    }
  }

  /**
   * @deprecated Use extractResumeText and analyzeConfirmedResume instead
   */
  public static async analyzeResume(
    resumeFile: ArrayBuffer,
    fileType: string,
    jobDescription: string
  ): Promise<ResumeAnalysisResult> {
    try {
      // Validate job description
      if (!jobDescription || jobDescription.trim().length < 50) {
        throw new Error('Please provide a more detailed job description for better analysis.');
      }

      // Extract text from resume
      const { text: resumeText, isSample } = await this.extractResumeText(resumeFile, fileType);
      console.log('[Resume Analysis] Final processed text length:', resumeText.length);
      console.log('[Resume Analysis] First 500 characters:', resumeText.substring(0, 500) + '...');

      if (isSample) {
        throw new Error('The uploaded resume appears to be a sample. Please upload a real resume.');
      }

      // Perform various analyses
      const readabilityScore = this.calculateReadabilityScore(resumeText);
      const sectionAnalysis = this.analyzeSections(resumeText);
      const skillsAnalysis = this.analyzeSkills(resumeText, jobDescription);
      const industryMatch = this.calculateIndustryMatch(resumeText, jobDescription);
      const lengthScore = this.analyzeLength(resumeText);

      // Calculate format score based on section completeness
      const totalSections = Object.keys(sectionAnalysis).length;
      const filledSections = Object.values(sectionAnalysis).filter((sec: any) => sec.found).length;
      const formatScore = totalSections > 0 ? filledSections / totalSections : 0;

      // Keyword score based on skills match
      const totalJobSkills = skillsAnalysis.technical.length + skillsAnalysis.soft.length;
      const matchedSkills = (skillsAnalysis.technical.length + skillsAnalysis.soft.length) - skillsAnalysis.missing.length;
      const keywordScore = totalJobSkills > 0 ? matchedSkills / totalJobSkills : 0;

      // Relevance score based on industry match
      const relevanceScore = industryMatch.score;

      // Generate suggestions
      const suggestions = this.generateSuggestions(sectionAnalysis, skillsAnalysis, industryMatch, readabilityScore, jobDescription, resumeText);

      // Calculate final match percentage
      const percentMatch = this.calculateFinalMatchPercentage({
        readability: readabilityScore,
        lengthScore,
        formatScore,
        keywordScore,
        relevanceScore
      });

      return {
        text: resumeText,
        percentMatch,
        readabilityScore,
        keywordMatches: skillsAnalysis.technical.reduce((acc: any, skill: string) => ({ ...acc, [skill]: 1 }), {}),
        missingKeywords: skillsAnalysis.missing,
        suggestions,
        detailedAnalysis: {
          readability: readabilityScore,
          lengthScore,
          formatScore,
          keywordScore,
          relevanceScore,
          sectionScores: Object.fromEntries(
            Object.entries(sectionAnalysis).map(([section, analysis]) => [section, analysis.found ? 1 : 0])
          )
        },
        sectionAnalysis,
        skillsAnalysis,
        industryMatch
      };
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw error;
    }
  }

  /**
   * Calculate a consistent hash for the resume content to ensure consistent scoring
   */
  private static calculateResumeHash(text: string): string {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

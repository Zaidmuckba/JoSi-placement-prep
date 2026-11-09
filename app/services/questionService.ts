import { db } from '../../firebase'
import { collection, query, where, getDocs, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'

export interface Question {
  id: string;
  text: string;
  type: 'technical' | 'behavioral' | 'company-specific';
  course?: string;
  company?: string;
  role?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source?: string;
  createdBy: string;
  lastUpdated: Date;
  modelAnswer?: string;
  keywords?: string[];
  subTopic?: string;
  maxScore: number;
}

export interface UserPreferences {
  course: string;
  company: string;
  role: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  matchedKeywords: string[];
  improvement: string;
}

export class QuestionService {
  private static instance: QuestionService;
  private questionCache: Map<string, Question[]> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          course: data.course,
          company: data.company,
          role: data.role
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async getQuestionsForUser(userId: string, type: 'written' | 'speech'): Promise<Question[]> {
    const userPrefs = await this.getUserPreferences(userId);
    if (!userPrefs) return [];

    const cacheKey = `${userPrefs.course}-${userPrefs.company}-${userPrefs.role}-${type}`;
    const cachedQuestions = this.questionCache.get(cacheKey);
    
    if (cachedQuestions) {
      return this.shuffleQuestions(cachedQuestions);
    }

    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('course', '==', userPrefs.course),
      where('company', '==', userPrefs.company),
      where('role', '==', userPrefs.role)
    );

    try {
      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Question);
      });

      // If not enough questions found, generate new ones
      if (questions.length < 10) {
        const newQuestions = await this.generateNewQuestions(userPrefs, userId);
        await this.saveNewQuestions(newQuestions);
        questions.push(...newQuestions);
      }

      // Cache the questions
      this.questionCache.set(cacheKey, questions);
      setTimeout(() => this.questionCache.delete(cacheKey), this.CACHE_DURATION);

      return this.shuffleQuestions(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }

  private shuffleQuestions(questions: Question[]): Question[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  evaluateAnswer(answer: string, question: Question): AnswerEvaluation {
    const normalizedAnswer = answer.toLowerCase();
    const matchedKeywords = question.keywords?.filter(keyword => 
      normalizedAnswer.includes(keyword.toLowerCase())
    ) || [];

    const keywordScore = matchedKeywords.length / (question.keywords?.length || 1);
    const lengthScore = Math.min(answer.length / 100, 1); // Encourage detailed answers
    
    let score = (keywordScore * 0.7 + lengthScore * 0.3) * question.maxScore;
    score = Math.round(score * 100) / 100; // Round to 2 decimal places

    let feedback = '';
    let improvement = '';

    if (score >= question.maxScore * 0.8) {
      feedback = 'Excellent answer! You demonstrated strong understanding of the topic.';
    } else if (score >= question.maxScore * 0.6) {
      feedback = 'Good answer, but there\'s room for improvement.';
      improvement = `Consider including these key points: ${
        question.keywords
          ?.filter(k => !matchedKeywords.includes(k))
          .join(', ')
      }`;
    } else {
      feedback = 'Your answer needs improvement.';
      improvement = `Review the topic and consider these key points: ${question.keywords?.join(', ')}`;
    }

    return {
      score,
      feedback,
      matchedKeywords,
      improvement
    };
  }

  private async generateNewQuestions(prefs: UserPreferences, userId: string): Promise<Question[]> {
    // Technical questions based on course
    const technicalQuestions = await this.generateTechnicalQuestions(prefs.course);
    
    // Company-specific questions
    const companyQuestions = [
      {
        text: `What specific contributions could you make to ${prefs.company}'s ${prefs.role} team based on your ${prefs.course} background?`,
        type: 'company-specific' as const,
        keywords: ['experience', 'contribution', 'skills', 'team', 'impact'],
        modelAnswer: `A strong answer should demonstrate knowledge of ${prefs.company}'s products/services and how your technical skills from ${prefs.course} align with their needs.`,
        maxScore: 10
      },
      {
        text: `How do you see the role of ${prefs.role} evolving at ${prefs.company} in the next 5 years?`,
        type: 'company-specific' as const,
        keywords: ['future', 'innovation', 'growth', 'technology', 'trends'],
        modelAnswer: 'Discuss industry trends, company direction, and technological advancement.',
        maxScore: 10
      }
    ];

    // Behavioral questions
    const behavioralQuestions = [
      {
        text: 'Describe a challenging technical problem you solved and how you approached it.',
        type: 'behavioral' as const,
        keywords: ['problem', 'solution', 'approach', 'result', 'learning'],
        modelAnswer: 'Structure response using STAR method: Situation, Task, Action, Result.',
        maxScore: 10
      },
      {
        text: 'How do you stay updated with the latest developments in your field?',
        type: 'behavioral' as const,
        keywords: ['learning', 'resources', 'community', 'practice', 'growth'],
        modelAnswer: 'Mention specific resources, communities, and learning practices.',
        maxScore: 10
      }
    ];

    const allQuestions = [
      ...technicalQuestions,
      ...companyQuestions,
      ...behavioralQuestions
    ];

    return allQuestions.map(q => ({
      id: `generated-${Date.now()}-${Math.random()}`,
      ...q,
      course: prefs.course,
      company: prefs.company,
      role: prefs.role,
      difficulty: 'medium' as const,
      createdBy: userId,
      lastUpdated: new Date()
    }));
  }

  private async generateTechnicalQuestions(course: string): Promise<Partial<Question>[]> {
    // Course-specific technical questions
    switch (course.toLowerCase()) {
      case 'computer science':
      case 'information technology':
        return [
          {
            text: 'Explain the difference between process and thread in operating systems.',
            type: 'technical',
            subTopic: 'Operating Systems',
            keywords: ['process', 'thread', 'memory', 'resources', 'scheduling'],
            modelAnswer: 'A process is an independent program with its own memory space, while a thread is a lightweight unit within a process sharing the same memory space.',
            maxScore: 10
          },
          {
            text: 'Describe the time complexity of common sorting algorithms and when to use each.',
            type: 'technical',
            subTopic: 'Algorithms',
            keywords: ['quicksort', 'mergesort', 'complexity', 'space', 'time'],
            modelAnswer: 'Compare QuickSort (O(n log n) average), MergeSort (O(n log n) worst case), and their use cases.',
            maxScore: 10
          },
          {
            text: 'Explain REST API principles and best practices.',
            type: 'technical',
            subTopic: 'Web Development',
            keywords: ['stateless', 'resource', 'http', 'methods', 'endpoints'],
            modelAnswer: 'Cover statelessness, resource-based URLs, HTTP methods, and status codes.',
            maxScore: 10
          },
          {
            text: 'How would you design a scalable microservices architecture?',
            type: 'technical',
            subTopic: 'System Design',
            keywords: ['microservices', 'scaling', 'communication', 'docker', 'kubernetes'],
            modelAnswer: 'Discuss service isolation, communication patterns, containerization, and orchestration.',
            maxScore: 10
          }
        ];
      
      case 'data science':
        return [
          {
            text: 'Compare and contrast different types of machine learning algorithms.',
            type: 'technical',
            subTopic: 'Machine Learning',
            keywords: ['supervised', 'unsupervised', 'reinforcement', 'classification', 'regression'],
            modelAnswer: 'Explain supervised, unsupervised, and reinforcement learning with examples.',
            maxScore: 10
          },
          {
            text: 'How do you handle missing data in a dataset?',
            type: 'technical',
            subTopic: 'Data Preprocessing',
            keywords: ['imputation', 'deletion', 'mean', 'median', 'prediction'],
            modelAnswer: 'Discuss various imputation methods and their trade-offs.',
            maxScore: 10
          }
        ];
      
      // Add more courses as needed
      default:
        return [];
    }
  }

  private async saveNewQuestions(questions: Question[]): Promise<void> {
    try {
      const batch = questions.map(question => 
        addDoc(collection(db, 'questions'), {
          ...question,
          lastUpdated: serverTimestamp()
        })
      );
      await Promise.all(batch);
    } catch (error) {
      console.error('Error saving new questions:', error);
    }
  }
}

import { Timestamp } from 'firebase/firestore';

export type PlacementEventType = 'ORIENTATION' | 'WRITTEN_TEST' | 'INTERVIEW_ROUND_1' | 'INTERVIEW_ROUND_2' | 'FINAL_ROUND';
export type PlacementEventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';
export type CandidateRound = 'WRITTEN_TEST' | 'INTERVIEW_ROUND_1' | 'INTERVIEW_ROUND_2' | 'FINAL_ROUND';
export type CandidateStatus = 'SHORTLISTED' | 'REJECTED' | 'SELECTED';

export interface PlacementEvent {
  id: string;
  companyName: string;
  eventType: PlacementEventType;
  title: string;
  description: string;
  startDate: string | Timestamp;
  endDate: string | Timestamp;
  location?: string;
  requiredDocuments?: string[];
  eligibilityCriteria?: {
    courses: string[];
    cgpa?: number;
    otherRequirements?: string[];
  };
  status: PlacementEventStatus;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  roles?: PlacementRole[];
  shortlistedCandidates?: ShortlistedCandidate[];
  selectedCandidates?: string[]; // Array of student IDs
}

export interface PlacementRole {
  title: string;
  description: string;
  package: {
    base: number;
    bonus?: number;
    other?: string;
  };
  requirements?: string[];
}

export interface ShortlistedCandidate {
  studentId: string;
  round: CandidateRound;
  status: CandidateStatus;
  feedback?: string;
}

export interface Interview {
  id: string;
  placementEventId: string;
  studentId: string;
  interviewType: 'TECHNICAL' | 'HR' | 'GROUP_DISCUSSION';
  scheduledTime: string;
  duration: number; // in minutes
  meetingLink?: string;
  venue?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  feedback?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'NEW_OPPORTUNITY' | 'DEADLINE_REMINDER' | 'INTERVIEW_SCHEDULED' | 'DOCUMENT_SUBMISSION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetUsers: string[]; // user IDs or course codes
  createdAt: string;
  readBy: string[]; // user IDs
}

export interface DocumentSubmission {
  id: string;
  placementEventId: string;
  studentId: string;
  documentType: string;
  status: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  submissionDate?: string;
  verificationDate?: string;
  feedback?: string;
  documentUrl?: string;
}

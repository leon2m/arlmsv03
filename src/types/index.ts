// Existing types...

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  organization?: string;
  role?: 'admin' | 'instructor' | 'student';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  preferences?: Record<string, any>;
}

export interface Certificate {
  id: string;
  userId: string;
  trainingId: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface SurveyType {
  id: string;
  type: 'entry' | 'feedback';
  title: string;
  description: string;
  isRequired: boolean;
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: number;
  type: 'rating' | 'text' | 'multiple_choice';
  text: string;
  options?: string[];
}

export interface ExamType {
  id: string;
  type: 'quiz' | 'final' | 'certification' | 'practice';
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  questions: ExamQuestion[];
  randomizeQuestions: boolean;
  showResults: boolean;
}

export interface ExamQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'essay' | 'matching';
  text: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

export interface TrainingContent {
  id: string;
  type: 'pptx' | 'pdf' | 'video' | 'scorm';
  title: string;
  description: string;
  url: string;
  duration?: number;
  slides?: number;
  lastModified: string;
}
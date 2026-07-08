// Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  role?: Role;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: 'teacher' | 'student' | 'admin';
  permissions: Record<string, boolean>;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

// Classroom Types
export interface Class {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  teacher?: User;
  class_code?: string;
  created_at: string;
}

export interface StudentClass {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
}

// Material Types
export interface Material {
  id: string;
  class_id: string;
  title: string;
  content: string;
  file_url?: string;
  file_type: 'pdf' | 'text' | 'image' | 'video';
  created_by: string;
  created_at: string;
}

export interface MaterialChunk {
  id: string;
  material_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  created_at: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  class_id: string;
  title: string;
  description: string;
  created_by: string;
  is_published: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  content: string;
  options?: Record<string, string>;
  correct_answer: string;
  explanation: string;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string;
  score?: number;
  learning_mode: 'normal' | 'socratic' | 'explainable';
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  attempt_number: number;
}

// Learning Mode Types
export interface LearningSession {
  id: string;
  quiz_attempt_id: string;
  current_question_id: string;
  wrong_attempt_count: number;
  mode: 'normal' | 'socratic' | 'explainable';
  state: Record<string, any>;
  created_at: string;
}

// AI Types
export interface ChatSession {
  id: string;
  user_id: string;
  quiz_attempt_id?: string;
  context?: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  endpoint: 'chat' | 'hint' | 'rag';
  tokens_used: number;
  created_at: string;
}

// Analytics Types
export interface StudentProgress {
  student_id: string;
  total_quizzes: number;
  completed_quizzes: number;
  average_score: number;
  last_activity: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Token configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
  TOKEN_ALGORITHM: 'HS256',
} as const;

// File upload configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif'],
  CHUNK_SIZE: 1000, // characters per chunk
  CHUNK_OVERLAP: 200, // characters overlap between chunks
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// AI Configuration
export const AI_CONFIG = {
  MODEL: 'mixtral-8x7b-32768', // Groq model
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
  TOP_P: 1,
  RAG_TOP_K: 5, // Number of similar chunks to retrieve
  EMBEDDING_MODEL: 'nomic-embed-text', // For embeddings
  HINT_MAX_TOKENS: 256,
} as const;

// Learning mode thresholds
export const LEARNING_MODE_CONFIG = {
  WRONG_ATTEMPTS_SOCRATIC: 2,
  WRONG_ATTEMPTS_EXPLAINABLE: 3,
} as const;

// Database table names
export const TABLES = {
  USERS: 'users',
  ROLES: 'roles',
  CLASSES: 'classes',
  STUDENT_CLASSES: 'student_classes',
  MATERIALS: 'materials',
  MATERIAL_CHUNKS: 'material_chunks',
  QUIZZES: 'quizzes',
  QUESTIONS: 'questions',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  ANSWERS: 'answers',
  LEARNING_SESSIONS: 'learning_sessions',
  CHAT_SESSIONS: 'chat_sessions',
  CHAT_MESSAGES: 'chat_messages',
  AI_USAGE_LOGS: 'ai_usage_logs',
  STUDENT_PROGRESS: 'student_progress',
  REFRESH_TOKENS: 'refresh_tokens',
} as const;

// Supabase Storage buckets
export const STORAGE_BUCKETS = {
  MATERIALS: 'materials',
  AVATARS: 'avatars',
} as const;

export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_001', status: 401, message: 'Invalid email or password' },
  AUTH_TOKEN_EXPIRED: { code: 'AUTH_002', status: 401, message: 'Token has expired' },
  AUTH_INSUFFICIENT_PERMISSION: { code: 'AUTH_003', status: 403, message: 'Insufficient permissions' },
  AUTH_INVALID_TOKEN: { code: 'AUTH_004', status: 401, message: 'Invalid or malformed token' },
  AUTH_USER_NOT_FOUND: { code: 'AUTH_005', status: 404, message: 'User not found' },
  AUTH_EMAIL_EXISTS: { code: 'AUTH_006', status: 409, message: 'Email already registered' },

  // Database errors
  DB_QUERY_FAILED: { code: 'DB_001', status: 500, message: 'Database query failed' },
  DB_NOT_FOUND: { code: 'DB_002', status: 404, message: 'Resource not found' },
  DB_CONSTRAINT_VIOLATION: { code: 'DB_003', status: 409, message: 'Database constraint violation' },

  // Validation errors
  VAL_INVALID_INPUT: { code: 'VAL_001', status: 400, message: 'Invalid input data' },
  VAL_MISSING_REQUIRED: { code: 'VAL_002', status: 400, message: 'Missing required fields' },
  VAL_INVALID_FORMAT: { code: 'VAL_003', status: 400, message: 'Invalid data format' },

  // AI errors
  AI_API_ERROR: { code: 'AI_001', status: 500, message: 'AI API error' },
  AI_RATE_LIMITED: { code: 'AI_002', status: 429, message: 'AI API rate limit exceeded' },
  AI_NO_CONTEXT: { code: 'AI_003', status: 400, message: 'No context available for RAG' },

  // File errors
  FILE_UPLOAD_FAILED: { code: 'FILE_001', status: 500, message: 'File upload failed' },
  FILE_INVALID_TYPE: { code: 'FILE_002', status: 400, message: 'Invalid file type' },
  FILE_TOO_LARGE: { code: 'FILE_003', status: 413, message: 'File too large' },

  // Business logic errors
  QUIZ_ALREADY_SUBMITTED: { code: 'QUIZ_001', status: 409, message: 'Quiz already submitted' },
  QUIZ_NOT_FOUND: { code: 'QUIZ_002', status: 404, message: 'Quiz not found' },
  CLASS_NOT_FOUND: { code: 'CLASS_001', status: 404, message: 'Class not found' },
  NOT_ENROLLED: { code: 'CLASS_002', status: 403, message: 'Student not enrolled in class' },

  // Server errors
  SERVER_ERROR: { code: 'SERVER_001', status: 500, message: 'Internal server error' },
};

export type ErrorCode = keyof typeof ERROR_CODES;

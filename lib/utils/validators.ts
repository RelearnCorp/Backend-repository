import { z } from 'zod';
import { AppError } from './error-handler';

// Auth validators
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// Classroom validators
export const CreateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(200),
  description: z.string().max(500).optional(),
});

export const EnrollSchema = z.object({
  class_code: z.string().min(1, 'Class code is required'),
});

// Material validators
export const CreateMaterialSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional(),
  file_type: z.enum(['pdf', 'text', 'image', 'video']),
  class_id: z.string().uuid('Invalid class ID'),
});

// Quiz validators
export const CreateQuizSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  is_published: z.boolean().default(false),
});

export const QuestionSchema = z.object({
  type: z.enum(['multiple_choice', 'short_answer', 'essay']),
  content: z.string().min(1, 'Question content is required'),
  options: z.record(z.string(), z.string()).optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional(),
  order_index: z.number().int().nonnegative(),
});

export const SubmitAnswerSchema = z.object({
  question_id: z.string().uuid('Invalid question ID'),
  student_answer: z.string().min(1, 'Answer is required'),
});

export const SubmitQuizSchema = z.object({
  attempt_id: z.string().uuid('Invalid attempt ID'),
  answers: z.array(SubmitAnswerSchema),
});

// AI validators
export const ChatMessageSchema = z.object({
  session_id: z.string().uuid('Invalid session ID').optional(),
  message: z.string().min(1, 'Message is required').max(2000),
  quiz_attempt_id: z.string().uuid().optional(),
});

export const HintRequestSchema = z.object({
  question_id: z.string().uuid('Invalid question ID'),
  attempt_number: z.number().int().nonnegative(),
});

export const RAGSearchSchema = z.object({
  query: z.string().min(1, 'Query is required').max(500),
  class_id: z.string().uuid('Invalid class ID'),
  limit: z.number().int().positive().default(5),
});

// Learning mode validators
export const LearningModeSchema = z.object({
  attempt_id: z.string().uuid('Invalid attempt ID'),
  wrong_attempts: z.number().int().nonnegative(),
});

// Analytics validators
export const AnalyticsQuerySchema = z.object({
  class_id: z.string().uuid('Invalid class ID').optional(),
  student_id: z.string().uuid('Invalid student ID').optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Pagination validator
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Validation helper
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    throw new AppError(
      'VAL_INVALID_INPUT',
      400,
      `Validation failed: ${JSON.stringify(fieldErrors)}`
    );
  }

  return result.data;
}
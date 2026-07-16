import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { createQuestion, getQuizQuestions } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const createQuestionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  question_type: z.enum(['multiple_choice', 'short_answer', 'essay']),
  options: z.any().optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    const { quizId } = params;

    // Only teachers can create questions
    if (auth.rolePermissions?.create_quiz !== true) {
      return sendError('FORBIDDEN', 403);
    }

    const body = await request.json();
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { question_text, question_type, options, correct_answer } = validation.data;

    // Get current question count to determine order
    const existingQuestions = await getQuizQuestions(quizId);
    const orderIndex = (existingQuestions?.length || 0) + 1;

    // Create question
    const question = await createQuestion(
      quizId,
      question_text,
      question_type,
      options || null,
      correct_answer,
      orderIndex
    );

    return sendSuccess(
      {
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        order_index: question.order_index,
      },
      'Question added successfully',
      201
    );
  } catch (error: any) {
    console.error('[API] Add question error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    const { quizId } = params;

    const questions = await getQuizQuestions(quizId);

    return sendSuccess(
      {
        questions: questions || [],
        count: questions?.length || 0,
      },
      'Questions retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] Get questions error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

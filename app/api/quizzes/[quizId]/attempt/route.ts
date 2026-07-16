import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { startQuizAttempt, getQuizQuestions } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const startAttemptSchema = z.object({
  learning_mode: z.enum(['normal', 'socratic', 'explainable']).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    const { quizId } = params;

    const body = await request.json();
    const validation = startAttemptSchema.safeParse(body);

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { learning_mode = 'normal' } = validation.data;

    // Start attempt
    const attempt = await startQuizAttempt(quizId, auth.userId, learning_mode);

    // Get questions for this quiz (without correct answers)
    const questions = await getQuizQuestions(quizId);
    const safeQuestions = questions?.map((q: any) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      order_index: q.order_index,
      // Don't include correct_answer
    })) || [];

    return sendSuccess(
      {
        attempt_id: attempt.id,
        quiz_id: attempt.quiz_id,
        learning_mode: attempt.learning_mode,
        questions: safeQuestions,
        total_questions: safeQuestions.length,
        created_at: attempt.created_at,
      },
      'Quiz attempt started',
      201
    );
  } catch (error: any) {
    console.error('[API] Start attempt error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

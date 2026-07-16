import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import {
  recordAnswer,
  getQuestionById,
  submitQuizAttempt,
  getAttemptById,
} from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string(),
      student_answer: z.string(),
    })
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    const { attemptId } = params;

    const body = await request.json();
    const validation = submitAnswersSchema.safeParse(body);

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { answers } = validation.data;

    // Get attempt to verify ownership
    const attempt = await getAttemptById(attemptId);
    if (!attempt || attempt.student_id !== auth.userId) {
      return sendError('FORBIDDEN', 403);
    }

    let score = 0;

    // Record each answer and calculate score
    for (const answer of answers) {
      const question = await getQuestionById(answer.question_id);
      if (!question) continue;

      const isCorrect = answer.student_answer === question.correct_answer;
      if (isCorrect) score++;

      await recordAnswer(attemptId, answer.question_id, answer.student_answer, isCorrect);
    }

    // Submit attempt with score
    const completedAttempt = await submitQuizAttempt(attemptId, score, answers.length);

    return sendSuccess(
      {
        attempt_id: completedAttempt.id,
        score: completedAttempt.score,
        total_questions: answers.length,
        percentage_score: completedAttempt.percentage_score,
        status: completedAttempt.status,
        completed_at: completedAttempt.completed_at,
      },
      'Quiz submitted successfully',
      200
    );
  } catch (error: any) {
    console.error('[API] Submit answers error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { createQuiz } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const createQuizSchema = z.object({
  class_id: z.string().min(1, 'Class ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Only teachers can create quizzes
    if (auth.rolePermissions?.create_quiz !== true) {
      return sendError('FORBIDDEN', 403);
    }

    const body = await request.json();
    const validation = createQuizSchema.safeParse(body);

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { class_id, title, description } = validation.data;

    // Create quiz
    const quiz = await createQuiz(class_id, title, description || null, auth.userId);

    return sendSuccess(
      {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        class_id: quiz.class_id,
        is_published: quiz.is_published,
        created_at: quiz.created_at,
      },
      'Quiz created successfully',
      201
    );
  } catch (error: any) {
    console.error('[API] Create quiz error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

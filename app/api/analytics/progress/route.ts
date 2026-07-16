import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import {
  getStudentProgress,
  getStudentClassProgress,
} from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const querySchema = z.object({
  class_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const searchParams = request.nextUrl.searchParams;
    const validation = querySchema.safeParse({
      class_id: searchParams.get('class_id') || undefined,
    });

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { class_id } = validation.data;

    let progress: any[] = [];

    if (class_id) {
      // Get progress for specific class
      progress = await getStudentClassProgress(auth.userId, class_id);
    } else {
      // Get overall progress
      progress = await getStudentProgress(auth.userId);
    }

    // Calculate summary stats
    const completedQuizzes = progress.length;
    const averageScore =
      progress.length > 0
        ? (
            progress.reduce((sum: number, p: any) => sum + (p.percentage_score || 0), 0) /
            progress.length
          ).toFixed(2)
        : 0;

    const bestScore =
      progress.length > 0 ? Math.max(...progress.map((p: any) => p.percentage_score || 0)) : 0;

    return sendSuccess(
      {
        student_id: auth.userId,
        completed_quizzes: completedQuizzes,
        average_score: averageScore,
        best_score: bestScore,
        quizzes: progress || [],
      },
      'Progress retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] Progress error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import {
  getTeacherClasses,
  getClassStatistics,
  getAIUsageStats,
} from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { ROLES } from '@/lib/constants/roles';
import { z } from 'zod';

const querySchema = z.object({
  class_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Only teachers can access analytics
    if (auth.userRole !== ROLES.TEACHER) {
      return sendError('FORBIDDEN', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const validation = querySchema.safeParse({
      class_id: searchParams.get('class_id') || undefined,
    });

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { class_id } = validation.data;

    // Get teacher's classes
    const classes = await getTeacherClasses(auth.userId);

    if (!classes || classes.length === 0) {
      return sendSuccess(
        {
          classes: [],
          statistics: [],
        },
        'Dashboard retrieved successfully'
      );
    }

    // Get statistics for each class
    const statistics = await Promise.all(
      classes.map(async (cls: any) => {
        const stats = await getClassStatistics(cls.id);
        const aiStats = await getAIUsageStats(cls.id);

        return {
          class_id: cls.id,
          class_name: cls.name,
          statistics: stats,
          ai_usage: aiStats,
        };
      })
    );

    // If class_id specified, filter to that class only
    const filteredStats = class_id
      ? statistics.filter((s: any) => s.class_id === class_id)
      : statistics;

    return sendSuccess(
      {
        teacher_id: auth.userId,
        total_classes: classes.length,
        statistics: filteredStats,
      },
      'Dashboard retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] Dashboard error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

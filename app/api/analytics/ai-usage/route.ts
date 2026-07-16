import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getAIUsageStats, getTeacherClasses } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { ROLES } from '@/lib/constants/roles';
import { z } from 'zod';

const querySchema = z.object({
  class_id: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    const searchParams = request.nextUrl.searchParams;
    const validation = querySchema.safeParse({
      class_id: searchParams.get('class_id'),
    });

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { class_id } = validation.data;

    // If teacher, verify ownership of class
    if (auth.userRole === ROLES.TEACHER) {
      const classes = await getTeacherClasses(auth.userId);
      const ownsClass = classes.some((c: any) => c.id === class_id);

      if (!ownsClass) {
        return sendError('FORBIDDEN', 403);
      }
    }

    // Get AI usage stats
    const stats = await getAIUsageStats(class_id);

    return sendSuccess(
      {
        class_id,
        ...stats,
      },
      'AI usage statistics retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] AI usage stats error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

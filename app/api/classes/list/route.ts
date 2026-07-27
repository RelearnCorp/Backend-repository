import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getTeacherClasses, getStudentClasses } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { ROLES } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    console.log('[API] auth:', auth);

    let classes: any[] = [];

    if (auth.userRole === ROLES.TEACHER) {
      classes = await getTeacherClasses(auth.userId);
    } else if (auth.userRole === ROLES.STUDENT) {
      classes = await getStudentClasses(auth.userId);
    } else if (auth.userRole === ROLES.ADMIN) {
      return sendError('NOT_IMPLEMENTED', 501);
    }

    return sendSuccess(
      {
        classes,
        count: classes.length,
      },
      'Classes retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] List classes error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

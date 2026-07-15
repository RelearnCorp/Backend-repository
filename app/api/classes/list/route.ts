import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getTeacherClasses, getStudentClasses } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { ROLES } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    let classes: any[] = [];

    // Teachers see their own classes
    if (auth.userRole === ROLES.TEACHER) {
      classes = await getTeacherClasses(auth.userId);
    }
    // Students see classes they're enrolled in
    else if (auth.userRole === ROLES.STUDENT) {
      const enrollments = await getStudentClasses(auth.userId);
      classes = enrollments.map((e: any) => e.class);
    }
    // Admins can see all classes (implement if needed)
    else if (auth.userRole === ROLES.ADMIN) {
      return sendError('NOT_IMPLEMENTED', 501);
    }

    return sendSuccess(
      {
        classes: classes || [],
        count: classes?.length || 0,
      },
      'Classes retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] List classes error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

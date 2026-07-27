import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import {
  getClassById,
  getClassStudents,
} from '@/lib/database/queries';
import {
  sendSuccess,
  sendError,
} from '@/lib/utils/response-formatter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);

    const { classId } = await params;

    console.log('[CLASS DETAIL] auth:', auth);
    console.log('[CLASS DETAIL] classId:', classId);

    const classData = await getClassById(classId);

    console.log('[CLASS DETAIL] classData:', classData);

    if (!classData) {
      return sendError('CLASS_NOT_FOUND', 404);
    }

    const students = await getClassStudents(classId);

    console.log('[CLASS DETAIL] students:', students);

    return sendSuccess(
      {
        id: classData.id,
        name: classData.name,
        description: classData.description,
        teacher_id: classData.teacher_id,
        class_code: classData.class_code,
        teacher: null,
        students: students || [],
        student_count: students?.length || 0,
        created_at: classData.created_at,
        updated_at: classData.updated_at,
      },
      'Class details retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] Get class details error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack,
    });

    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}
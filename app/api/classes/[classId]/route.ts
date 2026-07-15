import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getClassById, getClassStudents } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    const { classId } = params;

    // Get class details
    const classData = await getClassById(classId);

    if (!classData) {
      return sendError('CLASS_NOT_FOUND', 404);
    }

    // Get students in this class
    const students = await getClassStudents(classId);

    return sendSuccess(
      {
        id: classData.id,
        name: classData.name,
        description: classData.description,
        teacher_id: classData.teacher_id,
        class_code: classData.class_code,
        teacher: classData.teacher,
        students: students || [],
        student_count: students?.length || 0,
        created_at: classData.created_at,
        updated_at: classData.updated_at,
      },
      'Class details retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] Get class details error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

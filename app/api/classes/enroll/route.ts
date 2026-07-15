import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getClassByCode, enrollStudent } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const enrollSchema = z.object({
  class_code: z.string().min(1, 'Class code is required'),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    const body = await request.json();

    // Validate input
    const validation = enrollSchema.safeParse(body);
    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { class_code } = validation.data;

    // Find class by code
    const classData = await getClassByCode(class_code);
    if (!classData) {
      return sendError('CLASS_NOT_FOUND', 404);
    }

    // Enroll student
    await enrollStudent(auth.userId, classData.id);

    return sendSuccess(
      {
        class_id: classData.id,
        class_name: classData.name,
        teacher: classData.teacher,
      },
      'Successfully enrolled in class',
      201
    );
  } catch (error: any) {
    console.error('[API] Enroll student error:', error);
    
    if (error.message === 'ALREADY_ENROLLED') {
      return sendError('ALREADY_ENROLLED', 409);
    }

    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

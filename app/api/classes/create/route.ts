import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { CreateClassSchema } from '@/lib/utils/validators';
import { createClass } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { ROLES } from '@/lib/constants/roles';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Only teachers can create classes
    if (auth.rolePermissions?.create_class !== true) {
      return sendError('FORBIDDEN', 403);
    }

    const body = await request.json();
    
    // Validate input
    const validation = CreateClassSchema.safeParse(body);
    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { name, description } = validation.data;
    
    // Generate unique class code
    const classCode = crypto.randomBytes(6).toString('hex').toUpperCase();

    // Create class
    const newClass = await createClass(
      name,
      description || '',
      auth.userId,
      classCode
    );

    return sendSuccess(
      {
        id: newClass.id,
        name: newClass.name,
        description: newClass.description,
        teacher_id: newClass.teacher_id,
        class_code: newClass.class_code,
        created_at: newClass.created_at,
      },
      'Class created successfully',
      201
    );
  } catch (error: any) {
    console.error('[API] Create class error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

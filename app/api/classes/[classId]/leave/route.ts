import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { removeStudent } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';

export async function POST(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    const { classId } = params;

    // Remove student from class
    await removeStudent(auth.userId, classId);

    return sendSuccess(
      {
        message: 'Successfully left the class',
      },
      'Left class successfully'
    );
  } catch (error: any) {
    console.error('[API] Leave class error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getClassMaterials } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { z } from 'zod';

const querySchema = z.object({
  class_id: z.string().min(1, 'Class ID is required'),
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

    // Get materials
    const materials = await getClassMaterials(class_id);

    return sendSuccess(
      {
        materials: materials || [],
        count: materials?.length || 0,
      },
      'Materials retrieved successfully'
    );
  } catch (error: any) {
    console.error('[API] List materials error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}

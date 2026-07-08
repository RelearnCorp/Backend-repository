import { NextRequest } from 'next/server';
import { RefreshTokenSchema, validate } from '@/lib/utils/validators';
import { createErrorResponse, createSuccessResponse, handleError } from '@/lib/utils/error-handler';
import { AppError } from '@/lib/utils/error-handler';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';
import { getUserById } from '@/lib/database/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = validate(RefreshTokenSchema, body);

    // Verify refresh token
    const payload = verifyRefreshToken(validatedData.refresh_token);

    if (payload.type !== 'refresh') {
      return createErrorResponse('AUTH_INVALID_TOKEN');
    }

    // Get user
    const user = await getUserById(payload.user_id);
    if (!user) {
      return createErrorResponse('AUTH_USER_NOT_FOUND');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      user_id: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    });

    return createSuccessResponse({
      token: newAccessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error.code as any);
    }
    return handleError(error);
  }
}

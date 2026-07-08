import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { LoginSchema, validate } from '@/lib/utils/validators';
import { createErrorResponse, createSuccessResponse, handleError } from '@/lib/utils/error-handler';
import { AppError } from '@/lib/utils/error-handler';
import { generateTokenPair } from '@/lib/auth/jwt';
import { getUserByEmail } from '@/lib/database/queries';
import { formatUserResponse } from '@/lib/utils/response-formatter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = validate(LoginSchema, body);

    // Get user
    const user = await getUserByEmail(validatedData.email);
    if (!user) {
      return createErrorResponse('AUTH_INVALID_CREDENTIALS');
    }

    // Verify password
    // Support multiple possible password hash property names on User
    const passwordHash = (user as any).password_hash || (user as any).passwordHash || (user as any).password;
    if (!passwordHash) {
      return createErrorResponse('AUTH_INVALID_CREDENTIALS');
    }
    const passwordMatch = await bcrypt.compare(validatedData.password, passwordHash);
    if (!passwordMatch) {
      return createErrorResponse('AUTH_INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      user_id: user.id,
      email: user.email,
      role: user.role?.name ?? '',
      permissions: user.role?.permissions ?? {},
    });

    return createSuccessResponse({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error.code as any);
    }
    return handleError(error);
  }
}

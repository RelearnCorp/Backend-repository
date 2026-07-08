import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { RegisterSchema, validate } from '@/lib/utils/validators';
import { createErrorResponse, createSuccessResponse, handleError } from '@/lib/utils/error-handler';
import { AppError } from '@/lib/utils/error-handler';
import { generateTokenPair } from '@/lib/auth/jwt';
import { createUser, getUserByEmail, getStudentRoleId } from '@/lib/database/queries';
import { formatUserResponse } from '@/lib/utils/response-formatter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = validate(RegisterSchema, body);

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return createErrorResponse('AUTH_EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Get student role ID
    const roleId = await getStudentRoleId();

    // Create user
    const user = await createUser(validatedData.email, validatedData.full_name, passwordHash, roleId);

    // Generate tokens
    const tokens = generateTokenPair({
      user_id: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    });

    return createSuccessResponse(
      {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: formatUserResponse(user),
      },
      201
    );
  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error.code as any);
    }
    return handleError(error);
  }
}

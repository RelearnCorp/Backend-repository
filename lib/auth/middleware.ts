import { NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';
import { JWTPayload } from '@/types';
import { AppError } from '@/lib/utils/error-handler';

/**
 * Extract and verify JWT from request
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader ?? undefined);

  if (!token) {
    throw new AppError('AUTH_INVALID_TOKEN', 401);
  }

  return verifyAccessToken(token);
}

/**
 * Optional auth - returns user if present, null otherwise
 */
export async function getOptionalAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    return await getAuthUser(request);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware for protected routes
 * Usage: await requireAuth(request)
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  try {
    return await getAuthUser(request);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('AUTH_INVALID_TOKEN', 401);
  }
}

/**
 * Middleware for role-based access
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new AppError('AUTH_INSUFFICIENT_PERMISSION', 403);
  }

  return user;
}

/**
 * Middleware for permission-based access
 */
export async function requirePermissionMiddleware(
  request: NextRequest,
  requiredPermission: string
) {
  const user = await requireAuth(request);

  if (!user.permissions?.[requiredPermission]) {
    throw new AppError('AUTH_INSUFFICIENT_PERMISSION', 403);
  }

  return user;
}

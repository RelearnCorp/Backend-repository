import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { TOKEN_CONFIG } from '@/lib/constants/config';
import { AppError } from '@/lib/utils/error-handler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-this') {
  console.error('[JWT] ERROR: JWT_SECRET not configured in production!');
}

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY}s`,
    algorithm: TOKEN_CONFIG.TOKEN_ALGORITHM as any,
  });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ user_id: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: `${TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY}s`,
    algorithm: TOKEN_CONFIG.TOKEN_ALGORITHM as any,
  });
}

export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload.user_id),
  };
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: [TOKEN_CONFIG.TOKEN_ALGORITHM as any],
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('AUTH_INVALID_TOKEN', 401);
    }
    throw error;
  }
}

export function verifyRefreshToken(token: string): { user_id: string; type: string } {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: [TOKEN_CONFIG.TOKEN_ALGORITHM as any],
    }) as any;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('AUTH_INVALID_TOKEN', 401);
    }
    throw error;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

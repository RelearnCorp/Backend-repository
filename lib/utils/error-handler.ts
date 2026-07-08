import { NextResponse } from 'next/server';
import { ERROR_CODES, type ErrorCode } from '@/lib/constants/error-codes';
import { APIResponse } from '@/types';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public status: number = 500,
    message?: string
  ) {
    super(message || ERROR_CODES[code].message);
    this.name = 'AppError';
  }
}

export function getErrorResponse(code: ErrorCode, details?: Record<string, any>) {
  const error = ERROR_CODES[code];
  return {
    status: error.status,
    body: {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

export function createErrorResponse(code: ErrorCode, details?: Record<string, any>) {
  const { status, body } = getErrorResponse(code, details);
  return NextResponse.json(body, { status });
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  const response: APIResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function handleError(error: any) {
  console.error('[API Error]', error);

  if (error instanceof AppError) {
    return createErrorResponse(error.code);
  }

  if (error.code === 'PGRST116') {
    // Supabase not found error
    return createErrorResponse('DB_NOT_FOUND');
  }

  if (error.code === '23505') {
    // Unique constraint violation
    return createErrorResponse('DB_CONSTRAINT_VIOLATION', { field: error.detail });
  }

  return createErrorResponse('SERVER_ERROR', { originalError: error.message });
}

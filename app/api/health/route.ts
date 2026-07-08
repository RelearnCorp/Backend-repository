import { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  return createSuccessResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}

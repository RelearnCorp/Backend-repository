import { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/utils/error-handler';
import { getSupabaseConfigStatus as getClientSupabaseConfigStatus } from '@/lib/supabase/client';
import { getSupabaseConfigStatus as getServerSupabaseConfigStatus } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return createSuccessResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      supabaseClient: getClientSupabaseConfigStatus(),
      supabaseServer: getServerSupabaseConfigStatus(),
      groqApiKeyConfigured: Boolean(process.env.GROQ_API_KEY?.trim()),
      jwtSecretConfigured: Boolean(process.env.JWT_SECRET?.trim() && process.env.JWT_SECRET !== 'dev-secret-key'),
    },
  });
}

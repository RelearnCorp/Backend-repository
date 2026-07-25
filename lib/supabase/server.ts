import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function readEnvValue(primaryName: string, fallbackName?: string) {
  const primaryValue = process.env[primaryName]?.trim();
  if (primaryValue) {
    return primaryValue;
  }

  if (fallbackName) {
    const fallbackValue = process.env[fallbackName]?.trim();
    if (fallbackValue) {
      return fallbackValue;
    }
  }

  return '';
}

// Server-side Supabase client for authenticated operations
const supabaseUrl = readEnvValue('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
const supabaseServiceKey = readEnvValue('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY');
const hasServiceConfig = Boolean(supabaseUrl && supabaseServiceKey);

if (!hasServiceConfig) {
  console.warn('[Supabase] Warning: Service role key is not configured for server operations.');
}

export function getSupabaseConfigStatus() {
  return {
    urlConfigured: Boolean(supabaseUrl),
    serviceRoleConfigured: Boolean(supabaseServiceKey),
    isConfigured: hasServiceConfig,
  };
}

export async function getSupabaseServerClient() {
  await cookies();

  return createClient(supabaseUrl || 'https://example.supabase.co', supabaseServiceKey || 'service-role-key', {
    auth: {
      persistSession: false,
    },
  });
}

// For service-to-service operations (no session required)
export function getSupabaseServiceClient() {
  return createClient(supabaseUrl || 'https://example.supabase.co', supabaseServiceKey || 'service-role-key', {
    auth: {
      persistSession: false,
    },
  });
}

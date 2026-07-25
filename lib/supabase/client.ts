import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = readEnvValue('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
const supabaseAnonKey = readEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    '[Supabase] Warning: Supabase URL/anon key are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY).'
  );
}

export function getSupabaseConfigStatus() {
  return {
    urlConfigured: Boolean(supabaseUrl),
    anonKeyConfigured: Boolean(supabaseAnonKey),
    isConfigured: hasSupabaseConfig,
  };
}

export const supabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://example.supabase.co', 'public-anon-key');

// Re-export for convenience
export type SupabaseClient = typeof supabaseClient;

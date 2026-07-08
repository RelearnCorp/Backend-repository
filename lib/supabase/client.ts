import { createClient } from '@supabase/supabase-js';

// Note: These are placeholder values. You need to add your actual Supabase credentials
// in the environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Warning: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set'
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Re-export for convenience
export type SupabaseClient = typeof supabaseClient;

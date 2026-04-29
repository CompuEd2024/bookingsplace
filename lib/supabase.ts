import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only initialize if we have the variables, otherwise export a dummy/null client
// and provide a helper to check configuration
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// We use placeholders if missing to avoid crashing at module load
// but requests will fail if used without proper config
// Cache Buster: 2026-04-21T00:12:00Z - Availability Schema Refresh
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

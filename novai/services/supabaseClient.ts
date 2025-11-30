import { createClient } from '@supabase/supabase-js';

// Read env with fallback
const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key] as string;
    }
  } catch (_) {}

  return fallback;
};

// Supabase URL + Anon Key
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', '');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', '');

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
        db: { schema: 'public' },
      })
    : null;

export const isSupabaseConfigured = () => !!supabase;

import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// These are standard Anon keys safe for client-side use with RLS enabled.
const getEnv = (key: string, fallback: string): string => {
  try {
    // Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Check process.env (Node/Webpack)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignore errors
  }
  return fallback;
};

// --- ATTENTION ---
// The following are placeholder credentials for a public, read-only demo database.
// To use your own Supabase backend, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
// FIX: Export SUPABASE_URL to be used in other modules.
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://hnielgquavjcetnorgxn.supabase.co');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaWVsZ3F1YXZqY2V0bm9yZ3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1MDYyMzIsImV4cCI6MjAyMDA4MjIzMn0.sb_publishable_96MRc9DeO0fI76nlHoJ4jA_NWMqyvLp');

const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // CRITICAL: Ensures auth flow uses the current window location to prevent 'localhost refused'
        // when dev environment port differs from Supabase config
        flowType: 'pkce' 
      },
      db: {
        schema: 'public'
      }
    })
  : null;

export const isSupabaseConfigured = () => !!supabase;
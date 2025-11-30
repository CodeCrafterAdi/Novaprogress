import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect if Supabase is configured
export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.length > 10 &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 10
  );
};

// Create client only when env keys exist
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;


/* RESPONSIVE NOTES: Client-side logic, no UI. Handles realtime events and RPC calls. */
import { createClient } from '@supabase/supabase-js';

// Safe access to process.env to prevent crashes in environments where process is undefined
const getEnv = (key: string, fallback: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignore error
  }
  return fallback;
};

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://voawdvkcqyikeilflzzt.supabase.co');
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYXdkdmtjcXlpa2VpbGZsenp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjgxMzMsImV4cCI6MjA4MDM0NDEzM30.CyY1sv97cspgsoldQxZmNNcpY7juHQ6VdD7bQpHtFA4');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const addXp = async (userId: string, amount: number) => {
  try {
    const { data, error } = await supabase.rpc('add_xp', { 
      user_id_input: userId, 
      amount_input: amount 
    });
    
    if (error) {
      console.warn('RPC Error (add_xp):', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("XP Error:", e);
    return null;
  }
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

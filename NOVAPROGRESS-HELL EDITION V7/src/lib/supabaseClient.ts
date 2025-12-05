
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://voawdvkcqyikeilflzzt.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYXdkdmtjcXlpa2VpbGZsenp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjgxMzMsImV4cCI6MjA4MDM0NDEzM30.CyY1sv97cspgsoldQxZmNNcpY7juHQ6VdD7bQpHtFA4';

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

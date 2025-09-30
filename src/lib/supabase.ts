import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Provide a safe fallback that won't crash the app at import time.
// Any method access will throw a clear, actionable error message.
function createMissingEnvProxy(): any {
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(
        'Supabase env missing. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart.'
      );
    },
    apply() {
      throw new Error(
        'Supabase env missing. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart.'
      );
    },
  };
  return new Proxy({}, handler);
}

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)
  : createMissingEnvProxy();
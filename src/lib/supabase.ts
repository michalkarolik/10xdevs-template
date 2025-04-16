import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Default values for local development if environment variables aren't available
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Check if we're in a browser environment where localStorage is available
const isBrowser = typeof window !== 'undefined';

// Client-side Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Only use localStorage in browser environment
      ...(isBrowser && {
        storage: {
          getItem: (key) => {
            const value = localStorage.getItem(key);
            console.log(`[Auth] Getting ${key}, exists:`, !!value);
            return value;
          },
          setItem: (key, value) => {
            console.log(`[Auth] Setting ${key}`);
            localStorage.setItem(key, value);
          },
          removeItem: (key) => {
            console.log(`[Auth] Removing ${key}`);
            localStorage.removeItem(key);
          }
        }
      })
    }
  }
);

// For debugging - check if we have a session on client side
if (isBrowser) {
  supabase.auth.getSession().then(({ data }) => {
    console.log('Client-side session check:', data.session ? 'authenticated' : 'unauthenticated');
  });
}

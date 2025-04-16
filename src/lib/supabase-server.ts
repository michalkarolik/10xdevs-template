import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import type { Database } from '../types/database';

// Default values for local development if environment variables aren't available
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const createSupabaseServer = (context: any) => {
  // Extract auth cookies from request headers if available
  const authCookies = {};
  const cookieHeader = context.request?.headers?.get('cookie');
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && name.startsWith('sb-')) {
        authCookies[name] = decodeURIComponent(value);
      }
    });
    console.log('Found auth cookies:', Object.keys(authCookies));
  }

  // Create a new Supabase client for server-side usage
  const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        // If we have Astro context with cookies, use them
        ...(context?.cookies && {
          storage: {
            getItem: (key: string) => {
              const cookies = context.cookies.get(key);
              const value = cookies?.value ?? null;
              console.log(`[Server] Getting ${key}, exists:`, !!value);
              return value;
            },
            setItem: (key: string, value: string) => {
              console.log(`[Server] Setting ${key}`);
              context.cookies.set(key, value, {
                path: '/',
                httpOnly: true,
                secure: import.meta.env.PROD,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
              });
            },
            removeItem: (key: string) => {
              console.log(`[Server] Removing ${key}`);
              context.cookies.delete(key, { path: '/' });
            },
          },
        }),
      },
      global: {
        headers: {
          cookie: cookieHeader || '',
        },
      }
    }
  );

  return supabase;
};

import { createClient } from '@supabase/supabase-js';
import type { CookieSerializeOptions } from 'cookie';

// Load environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client (server-side only)
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  user: UserData | null;
  token: string | null;
  error?: string;
}

export const cookieOptions: CookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
  secure: import.meta.env.PROD,
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

export const authenticationService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userData = data.user ? {
        id: data.user.id,
        username: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
      } : null;

      return {
        user: userData,
        token: data.session?.access_token || null,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error during sign in',
      };
    }
  },

  async signUp(email: string, password: string, username: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      const userData = data.user ? {
        id: data.user.id,
        username: username || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
      } : null;

      return {
        user: userData,
        token: data.session?.access_token || null,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error during sign up',
      };
    }
  },

  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error during sign out',
      };
    }
  },

  async getUserFromToken(token: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) return null;
      
      return {
        id: data.user.id,
        username: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },
  
  async verifyToken(token: string): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getUser(token);
      return !!data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
};

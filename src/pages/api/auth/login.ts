import type { APIRoute } from 'astro';
import { authenticationService, cookieOptions } from '../../../lib/server/authenticationService';
import { AUTH_TOKEN_COOKIE, setCookie } from '../../../lib/cookies';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Login attempt for ${email}`);
    const { user, token, error } = await authenticationService.signIn(email, password);

    if (error || !user || !token) {
      console.log(`Login failed for ${email}: ${error || 'No user or token returned'}`);
      return new Response(
        JSON.stringify({ error: error || 'Authentication failed' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set authentication cookie with more specific options
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    // Set cookie with appropriate options
    console.log("USTAWIAN COOKIE, ", token);
    const cookieStr = setCookie(AUTH_TOKEN_COOKIE, token, {
      ...cookieOptions,
      sameSite: 'lax', // Use lax instead of strict for better compatibility
      path: '/',
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    headers.append('Set-Cookie', cookieStr);

    console.log(`Login successful for ${email}, cookie set.`);
    
    return new Response(
      JSON.stringify({ 
        user,
        success: true 
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Disable pre-rendering for this endpoint
export const prerender = false;

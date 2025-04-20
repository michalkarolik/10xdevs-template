import type { APIRoute } from 'astro';
import { authenticationService } from '../../../lib/server/authenticationService';
import { AUTH_TOKEN_COOKIE, getCookie } from '../../../lib/cookies';

// Change from 'get' to 'GET' to match Astro's endpoint naming convention
export const GET: APIRoute = async ({ request }) => {
  try {
    // Get token from cookie or Authorization header
    const cookieHeader = request.headers.get('cookie') || '';
    const token = getCookie(AUTH_TOKEN_COOKIE, cookieHeader) 
      || request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await authenticationService.getUserFromToken(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('User API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Disable pre-rendering for this endpoint
export const prerender = false;

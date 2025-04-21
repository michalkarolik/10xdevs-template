import { authenticationService } from '../lib/server/authenticationService';
import { AUTH_TOKEN_COOKIE, getCookie } from '../lib/cookies';

export async function verifyAuth(request: Request): Promise<{
  authorized: boolean;
  userId?: string;
}> {
  // Extract token from cookie or Authorization header
  const cookieHeader = request.headers.get('cookie') || '';
  const token = getCookie(AUTH_TOKEN_COOKIE, cookieHeader)

  if (!token) {
    return { authorized: false };
  }

  const user = await authenticationService.getUserFromToken(token);
  
  if (!user) {
    return { authorized: false };
  }

  return { authorized: true, userId: user.id };
}

export async function requireAuth(request: Request): Promise<Response | { userId: string }> {
  const { authorized, userId } = await verifyAuth(request);
  
  if (!authorized || !userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return { userId };
}

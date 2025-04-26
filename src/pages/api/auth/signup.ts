import type { APIRoute } from "astro";
import { authenticationService, cookieOptions } from "../../../lib/server/authenticationService";
import { AUTH_TOKEN_COOKIE, setCookie } from "../../../lib/cookies";

// Change from 'post' to 'POST' to match Astro's endpoint naming convention
export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ error: "Email, password, and username are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { user, token, error } = await authenticationService.signUp(email, password, username);

    if (error || !user || !token) {
      return new Response(JSON.stringify({ error: error || "Registration failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Set authentication cookie
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Set-Cookie", setCookie(AUTH_TOKEN_COOKIE, token, cookieOptions));

    return new Response(JSON.stringify({ user }), { status: 200, headers });
  } catch (error) {
    console.error("Signup API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Disable pre-rendering for this endpoint
export const prerender = false;

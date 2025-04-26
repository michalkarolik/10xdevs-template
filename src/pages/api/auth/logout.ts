import type { APIRoute } from "astro";
import { authenticationService } from "../../../lib/server/authenticationService";
import { AUTH_TOKEN_COOKIE, setCookie } from "../../../lib/cookies";

// Change from 'post' to 'POST' to match Astro's endpoint naming convention
export const POST: APIRoute = async () => {
  try {
    const { error } = await authenticationService.signOut();

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Clear the auth cookie
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append(
      "Set-Cookie",
      setCookie(AUTH_TOKEN_COOKIE, "", {
        path: "/",
        maxAge: -1,
        httpOnly: true,
        sameSite: "strict",
        secure: import.meta.env.PROD,
      })
    );

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    console.error("Logout API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Disable pre-rendering for this endpoint
export const prerender = false;

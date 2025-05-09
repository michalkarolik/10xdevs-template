import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponse } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";
import { getToken } from "@src/lib/client/authClient";

// Schema for saving a flashcard response
const saveResponseSchema = z.object({
  session_id: z.string().uuid("Session ID must be a valid UUID"),
  flashcard_id: z.string().uuid("Flashcard ID must be a valid UUID"),
  user_response: z.enum(["Again", "Hard", "Easy"], {
    errorMap: () => ({ message: "Response must be one of: Again, Hard, Easy" }),
  }),
});

// POST endpoint to save a flashcard response
export const POST: APIRoute = async ({ request, locals }) => {
  // Authentication check
  const token = getToken();
  if (!token) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "UNAUTHORIZED",
        message: "Missing authentication token",
      } as ErrorResponse),
      { status: 401 }
    );
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "UNAUTHORIZED",
        message: "Invalid authentication token",
      } as ErrorResponse),
      { status: 401 }
    );
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: true,
          code: "BAD_REQUEST",
          message: "Invalid JSON body",
        } as ErrorResponse),
        { status: 400 }
      );
    }

    const validationResult = saveResponseSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: true,
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: validationResult.error.flatten(),
        } as ErrorResponse),
        { status: 400 }
      );
    }

    const { session_id, flashcard_id, user_response } = validationResult.data;

    // Verify the session exists and belongs to the user
    const { data: sessionData, error: sessionError } = await locals.supabase
      .from("learning_sessions")
      .select("id")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionError) {
      console.error("Supabase session check error:", sessionError);
      throw new Error("Database error checking session existence.");
    }

    if (!sessionData) {
      return new Response(
        JSON.stringify({
          error: true,
          code: "NOT_FOUND",
          message: "Learning session not found or access denied",
        } as ErrorResponse),
        { status: 404 }
      );
    }

    console.log(`Saving flashcard response to database:`, {
      learning_session_id: session_id,
      flashcard_id: flashcard_id,
      user_response: user_response,
    });

    // Save the flashcard response
    const { data: newResponse, error: responseError } = await locals.supabase
      .from("learning_session_flashcards")
      .insert({
        learning_session_id: session_id,
        flashcard_id: flashcard_id,
        user_response: user_response,
      })
      .select("id, created_at")
      .single();

    if (responseError) {
      console.error("Supabase response saving error:", responseError);
      throw new Error("Failed to save flashcard response.");
    }

    return new Response(
      JSON.stringify({
        id: newResponse.id,
        created_at: newResponse.created_at,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving flashcard response:", error);
    return new Response(
      JSON.stringify({
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      } as ErrorResponse),
      { status: 500 }
    );
  }
};

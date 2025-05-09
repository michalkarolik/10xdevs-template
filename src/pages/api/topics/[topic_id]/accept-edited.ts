import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponse, FlashcardAcceptEditedDto } from "@/types";
import { FLASHCARD_LIMITS } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";
import { getToken } from "@src/lib/client/authClient";

// Use the same input schema as the 'accept' endpoint
const inputSchema = z.object({
  front: z
    .string()
    .min(1, "Front text is required")
    .max(FLASHCARD_LIMITS.FRONT_MAX_LENGTH, `Front text cannot exceed ${FLASHCARD_LIMITS.FRONT_MAX_LENGTH} characters`),
  back: z
    .string()
    .min(1, "Back text is required")
    .max(FLASHCARD_LIMITS.BACK_MAX_LENGTH, `Back text cannot exceed ${FLASHCARD_LIMITS.BACK_MAX_LENGTH} characters`),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  // 1. Authentication & Authorization using getToken()
  const token = getToken();
  if (!token) {
    return new Response(
      JSON.stringify({ error: true, code: "UNAUTHORIZED", message: "Missing authentication token" } as ErrorResponse),
      { status: 401 }
    );
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({ error: true, code: "UNAUTHORIZED", message: "Invalid authentication token" } as ErrorResponse),
      { status: 401 }
    );
  }

  // 2. Validate Topic ID
  const { topic_id } = params;
  if (!topic_id) {
    return new Response(
      JSON.stringify({ error: true, code: "BAD_REQUEST", message: "Missing topic ID" } as ErrorResponse),
      { status: 400 }
    );
  }
  // Validate if topic_id looks like a UUID
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(topic_id)) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "BAD_REQUEST",
        message: "Invalid topic ID format (must be a UUID)",
      } as ErrorResponse),
      { status: 400 }
    );
  }

  // 3. Parse and Validate Request Body
  let requestBody: FlashcardAcceptEditedDto; // Use specific DTO type
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: true, code: "BAD_REQUEST", message: "Invalid JSON body" } as ErrorResponse),
      { status: 400 }
    );
  }

  const validationResult = inputSchema.safeParse(requestBody);
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

  const { front, back } = validationResult.data;

  // 4. Database Interaction
  try {
    // Verify topic exists and belongs to the user (RLS should handle ownership)
    const { data: topicData, error: topicError } = await locals.supabase
      .from("topics")
      .select("id")
      .eq("id", topic_id) // Use UUID directly
      // .eq('user_id', user.id) // RLS handles this
      .maybeSingle();

    if (topicError) {
      console.error("Supabase topic check error (edited):", topicError);
      throw new Error("Database error checking topic existence.");
    }
    if (!topicData) {
      // Topic doesn't exist or user doesn't have access via RLS
      return new Response(
        JSON.stringify({
          error: true,
          code: "NOT_FOUND",
          message: "Topic not found or access denied",
        } as ErrorResponse),
        { status: 404 }
      );
    }

    // Insert the new flashcard with 'ai-edited' source
    const { data: newFlashcard, error: insertError } = await locals.supabase
      .from("flashcards")
      .insert({
        topic_id: topic_id, // Use UUID
        front: front,
        back: back,
        source: "ai-edited", // Set source explicitly to 'ai-edited'
      })
      .select("id, front, back, source, created_at, updated_at") // Select fields matching FlashcardAcceptEditedResponseDto
      .single();

    if (insertError) {
      console.error("Supabase insert error (edited):", insertError);
      throw new Error("Failed to save edited flashcard to database.");
    }
    if (!newFlashcard) {
      throw new Error("Database did not return the newly created edited flashcard.");
    }

    // 5. Return Success Response
    return new Response(JSON.stringify(newFlashcard), {
      status: 201, // 201 Created
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error accepting edited flashcard:", error);
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

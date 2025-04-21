import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponse } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";

// Schema for creating a new learning session
const createSessionSchema = z.object({
  topic_id: z.string().uuid("Topic ID must be a valid UUID"),
});

// Schema for saving a flashcard response
const saveResponseSchema = z.object({
  session_id: z.string().uuid("Session ID must be a valid UUID"),
  flashcard_id: z.string().uuid("Flashcard ID must be a valid UUID"),
  user_response: z.enum(["Again", "Hard", "Easy"], {
    errorMap: () => ({ message: "Response must be one of: Again, Hard, Easy" }),
  }),
});

// POST endpoint to create a new learning session
export const POST: APIRoute = async ({ request, locals }) => {
  // Authentication check
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response(
      JSON.stringify({
        error: true, 
        code: 'UNAUTHORIZED', 
        message: 'Missing authentication token' 
      } as ErrorResponse), 
      { status: 401 }
    );
  }
  
  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({
        error: true, 
        code: 'UNAUTHORIZED', 
        message: 'Invalid authentication token' 
      } as ErrorResponse), 
      { status: 401 }
    );
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          error: true, 
          code: 'BAD_REQUEST', 
          message: 'Invalid JSON body' 
        } as ErrorResponse), 
        { status: 400 }
      );
    }

    const validationResult = createSessionSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: true, 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid input data', 
          details: validationResult.error.flatten() 
        } as ErrorResponse), 
        { status: 400 }
      );
    }

    const { topic_id } = validationResult.data;

    // Create a new learning session
    const { data: newSession, error: sessionError } = await locals.supabase
      .from('learning_sessions')
      .insert({
        user_id: user.id,
        // topic_id: topic_id, // Usunięto - brak kolumny w tabeli wg migracji
      })
      .select('id, created_at')
      .single();

    if (sessionError) {
      console.error("Supabase session creation error:", sessionError);
      throw new Error("Failed to create learning session.");
    }

    return new Response(
      JSON.stringify({
        session_id: newSession.id,
        created_at: newSession.created_at
      }), 
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating learning session:", error);
    return new Response(
      JSON.stringify({ 
        error: true, 
        code: 'INTERNAL_SERVER_ERROR', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      } as ErrorResponse), 
      { status: 500 }
    );
  }
};

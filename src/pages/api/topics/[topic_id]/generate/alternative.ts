import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardGenerateAlternativeDto, FlashcardGenerateAlternativeResponseDto, ErrorResponse } from "@/types";
import { FLASHCARD_LIMITS } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";

// Schema for the request body, matching FlashcardGenerateAlternativeDto
const inputSchema = z.object({
  source_text: z.string().min(1, "Source text is required"), // Keep source text for context if AI needs it
  original_front: z.string().min(1, "Original front text is required").max(FLASHCARD_LIMITS.FRONT_MAX_LENGTH), // Validate against limits
  original_back: z.string().min(1, "Original back text is required").max(FLASHCARD_LIMITS.BACK_MAX_LENGTH), // Validate against limits
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  // 1. Authentication & Authorization
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Missing authentication token' } as ErrorResponse), { status: 401 });
  }
  
  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Invalid authentication token' } as ErrorResponse), { status: 401 });
  }

  // 2. Validate Topic ID
  const { topic_id } = params;
  if (!topic_id) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Missing topic ID' } as ErrorResponse), { status: 400 });
  }
  // Basic UUID format check
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
   if (!uuidRegex.test(topic_id)) {
      return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid topic ID format (must be a UUID)' } as ErrorResponse), { status: 400 });
   }

  // 3. Parse and Validate Request Body
  let requestBody: FlashcardGenerateAlternativeDto;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid JSON body' } as ErrorResponse), { status: 400 });
  }

  const validationResult = inputSchema.safeParse(requestBody);
  if (!validationResult.success) {
    return new Response(JSON.stringify({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid input data', details: validationResult.error.flatten() } as ErrorResponse), { status: 400 });
  }

  const { source_text, original_front, original_back } = validationResult.data;

  // 4. AI Interaction (Placeholder)
  try {
    // TODO: Replace with actual call to AI service (e.g., OpenRouter via a helper function)
    // const aiResponse = await generateAlternativeFlashcard({
    //   sourceText: source_text,
    //   originalFront: original_front,
    //   originalBack: original_back,
    // });

    // --- Placeholder Simulation ---
    console.log(`Simulating AI alternative generation for topic ${topic_id}`);
    // Simulate generating a slightly different version
    const alternativeFront = `Alt: ${original_front.substring(0, 50)}... (${Date.now() % 100})`;
    const alternativeBack = `Alternative back based on: ${original_back.substring(0, 100)}...`;
    const exceedsLimit = alternativeFront.length > FLASHCARD_LIMITS.FRONT_MAX_LENGTH || alternativeBack.length > FLASHCARD_LIMITS.BACK_MAX_LENGTH;

    const generatedAlternative: FlashcardGenerateAlternativeResponseDto = {
      front: alternativeFront.substring(0, FLASHCARD_LIMITS.FRONT_MAX_LENGTH), // Ensure limits respected even in simulation
      back: alternativeBack.substring(0, FLASHCARD_LIMITS.BACK_MAX_LENGTH),
      exceeds_limit: exceedsLimit, // This might be false now due to substring
    };
    // --- End Placeholder ---

    // 5. Return Success Response
    return new Response(JSON.stringify(generatedAlternative), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating alternative flashcard:", error);
    // Check if it's an error from the AI service or internal
    // const errorCode = error?.isAiError ? 'AI_SERVICE_ERROR' : 'INTERNAL_SERVER_ERROR';
    const errorCode = 'INTERNAL_SERVER_ERROR'; // Default for now
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during alternative generation.';
    return new Response(JSON.stringify({ error: true, code: errorCode, message: message } as ErrorResponse), { status: 500 });
  }
};


import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardAcceptDto, FlashcardAcceptResponseDto, ErrorResponse } from "@/types";
import { FLASHCARD_LIMITS } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";
import { getToken } from "@src/lib/client/authClient";

const inputSchema = z.object({
  front: z.string().min(1, "Front text is required").max(FLASHCARD_LIMITS.FRONT_MAX_LENGTH, `Front text cannot exceed ${FLASHCARD_LIMITS.FRONT_MAX_LENGTH} characters`),
  back: z.string().min(1, "Back text is required").max(FLASHCARD_LIMITS.BACK_MAX_LENGTH, `Back text cannot exceed ${FLASHCARD_LIMITS.BACK_MAX_LENGTH} characters`),
});

export async function processFlashcardAccept(topic_id: string, front: string, back: string, supabase: any): Promise<FlashcardAcceptResponseDto> {
  const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .eq('id', topic_id)
      .maybeSingle();

  if (topicError) {
    console.error("Supabase topic check error:", topicError);
    throw new Error("Database error checking topic existence.");
  }
  if (!topicData) {
    throw new Error('NOT_FOUND');
  }

  const { data: newFlashcard, error: insertError } = await supabase
    .from('flashcards')
    .insert({
      topic_id: topic_id,
      front: front,
      back: back,
      source: 'ai-generated'
    })
    .select('id, front, back, source, created_at, updated_at')
    .single();

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    throw new Error("Failed to save flashcard to database.");
  }
  if (!newFlashcard) {
    throw new Error("Database did not return the newly created flashcard.");
  }
  return newFlashcard;
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const token = getToken();
  if (!token) {
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Missing authentication token' } as ErrorResponse), { status: 401 });
  }
  
  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Invalid authentication token' } as ErrorResponse), { status: 401 });
  }

  const { topic_id } = params;
  if (!topic_id) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Missing topic ID' } as ErrorResponse), { status: 400 });
  }
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(topic_id)) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid topic ID format (must be a UUID)' } as ErrorResponse), { status: 400 });
  }

  let requestBody: FlashcardAcceptDto;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid JSON body' } as ErrorResponse), { status: 400 });
  }

  const validationResult = inputSchema.safeParse(requestBody);
  if (!validationResult.success) {
    return new Response(JSON.stringify({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid input data', details: validationResult.error.flatten() } as ErrorResponse), { status: 400 });
  }

  const { front, back } = validationResult.data;

  try {
    const newFlashcard = await processFlashcardAccept(topic_id, user, front, back, locals.supabase);
    return new Response(JSON.stringify(newFlashcard), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error accepting flashcard:", error);
    let status = 500;
    let message = 'Internal Server Error';
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        status = 404;
        message = 'Topic not found or access denied';
      } else {
        message = error.message;
      }
    }
    return new Response(JSON.stringify({ error: true, code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR', message } as ErrorResponse), { status });
  }
};

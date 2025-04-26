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

export async function processFlashcardAccept(topic_id: string, front: string, back: string, source: string, supabase: any): Promise<FlashcardAcceptResponseDto> {
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
      source: source
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

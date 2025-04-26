import type { FlashcardAcceptResponseDto } from "@/types";

export async function processFlashcardAccept(
  topic_id: string,
  front: string,
  back: string,
  source: string,
  supabase: unknown
): Promise<FlashcardAcceptResponseDto> {
  const { data: topicData, error: topicError } = await supabase
    .from("topics")
    .select("id")
    .eq("id", topic_id)
    .maybeSingle();

  if (topicError) {
    console.error("Supabase topic check error:", topicError);
    throw new Error("Database error checking topic existence.");
  }
  if (!topicData) {
    throw new Error("NOT_FOUND");
  }

  const { data: newFlashcard, error: insertError } = await supabase
    .from("flashcards")
    .insert({
      topic_id: topic_id,
      front: front,
      back: back,
      source: source,
    })
    .select("id, front, back, source, created_at, updated_at")
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

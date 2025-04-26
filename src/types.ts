import type { FlashcardSource, Tables } from "./db/database.types";

/**
 * Base entities from database tables
 */
export type User = Tables<"users">;
export type Topic = Tables<"topics">;
export type Flashcard = Tables<"flashcards">;

/**
 * Common response types
 */
export interface SuccessResponse {
  success: boolean;
}

export interface ErrorResponse {
  error: true;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Topic-related DTOs
 */
export interface TopicSummaryDto extends Pick<Topic, "id" | "name" | "created_at" | "updated_at"> {
  flashcard_count: number;
}

export type TopicsResponseDto = TopicSummaryDto[];

export type TopicCreateDto = Pick<Topic, "name">;

export type TopicResponseDto = Pick<Topic, "id" | "name" | "created_at" | "updated_at">;

export interface TopicDetailDto extends Pick<Topic, "id" | "name" | "created_at" | "updated_at"> {
  flashcards: FlashcardResponseDto[];
}

export type TopicUpdateDto = Pick<Topic, "name">;

export type TopicUpdateResponseDto = Pick<Topic, "id" | "name" | "updated_at">;

export type DeleteTopicResponseDto = SuccessResponse;

/**
 * Flashcard-related DTOs
 */
export type FlashcardResponseDto = Pick<Flashcard, "id" | "front" | "back" | "source" | "created_at" | "updated_at">;

export type FlashcardsResponseDto = FlashcardResponseDto[];

export type FlashcardCreateDto = Pick<Flashcard, "front" | "back">;

export type FlashcardDetailDto = FlashcardResponseDto;

export type FlashcardUpdateDto = Pick<Flashcard, "front" | "back">;

export type FlashcardUpdateResponseDto = Pick<Flashcard, "id" | "front" | "back" | "source" | "updated_at">;

export type DeleteFlashcardResponseDto = SuccessResponse;

/**
 * AI Generation-related DTOs
 */
export interface FlashcardGenerateDto {
  source_text: string;
}

export interface FlashcardGeneratedDto {
  front: string;
  back: string;
  // exceeds_limit: boolean; // Removed
}

export type FlashcardGeneratedResponseDto = FlashcardGeneratedDto[];

export interface FlashcardGenerateAlternativeDto {
  source_text: string;
  original_front: string;
  original_back: string;
}

export type FlashcardGenerateAlternativeResponseDto = FlashcardGeneratedDto;

export interface FlashcardAcceptDto {
  front: string;
  back: string;
}

export interface FlashcardAcceptResponseDto
  extends Pick<Flashcard, "id" | "front" | "back" | "created_at" | "updated_at"> {
  source: FlashcardSource; // Source is determined by the API endpoint logic
}

export type FlashcardAcceptEditedDto = FlashcardAcceptDto;

export interface FlashcardAcceptEditedResponseDto
  extends Pick<Flashcard, "id" | "front" | "back" | "created_at" | "updated_at"> {
  source: FlashcardSource; // Source is determined by the API endpoint logic
}

/**
 * Learning-related DTOs
 */
export type StartSessionDto = { topic_id: string } | { all: true };

export interface SessionResponseDto {
  session_id: string;
  cards_count: number;
  first_card: {
    card_id: string;
    front: string;
    back: string;
    position: number;
    total: number;
  };
}

export interface NextCardResponseDto {
  card_id: string;
  front: string;
  back: string;
  position: number;
  total: number;
}

export interface CardRateDto {
  card_id: string;
  rating: number; // 1-5 scale typically
}

export interface CardRateResponseDto {
  next_review_date: string;
  next_card: NextCardResponseDto | null;
}

export interface LearningStatsDto {
  cards_learned: number;
  mastery_level: number; // Percentage
  streaks: {
    current: number;
    longest: number;
  };
}

/**
 * Character limit constants
 */
export const FLASHCARD_LIMITS = {
  FRONT_MAX_LENGTH: 100,
  BACK_MAX_LENGTH: 500,
};

/**
 * ViewModels for UI state
 */
export interface FlashcardSuggestionViewModel {
  id: string; // Client-side unique ID
  front: string;
  back: string;
  // exceeds_limit: boolean; // Removed as it's not provided by the new endpoint
  isEditing: boolean;
  originalFront?: string; // Keep original values for editing/reverting
  originalBack?: string;
}

export interface TopicSummaryDto {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  flashcard_count?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic_id: string;
  source: "ai-generated" | "ai-edited" | "manual";
  created_at: string;
  updated_at: string;
}

import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardResponseDto, ErrorResponse } from "@/types";
import { FLASHCARD_LIMITS } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";
import { getToken } from "@src/lib/client/authClient";

// Schema for validating the request body for manual flashcard creation
const manualFlashcardSchema = z.object({
  front: z.string()
    .min(1, "Front text is required")
    .max(FLASHCARD_LIMITS.FRONT_MAX_LENGTH, `Front text cannot exceed ${FLASHCARD_LIMITS.FRONT_MAX_LENGTH} characters`),
  back: z.string()
    .min(1, "Back text is required")
    .max(FLASHCARD_LIMITS.BACK_MAX_LENGTH, `Back text cannot exceed ${FLASHCARD_LIMITS.BACK_MAX_LENGTH} characters`),
});

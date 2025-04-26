import type { APIRoute } from "astro";
import { z } from "zod";
import { type Message, OpenRouterService } from "@/lib/services/openrouter"; // Upewnij się, że ścieżka jest poprawna
import { zodToJsonSchema } from "zod-to-json-schema"; // Import zodToJsonSchema

// Schemat dla pojedynczej fiszki
const FlashcardSchema = z
  .object({
    front: z.string().min(1).describe("The front content of the flashcard (question or term)"),
    back: z.string().min(1).describe("The back content of the flashcard (answer or definition)"),
  })
  .describe("A single flashcard with front and back text.");

// Schemat dla odpowiedzi zawierającej listę fiszek
const FlashcardsResponseSchema = z
  .object({
    flashcards: z.array(FlashcardSchema).min(1).describe("An array of generated flashcards"),
  })
  .describe("A list of generated flashcards based on the source text.");

// Schemat dla ciała żądania POST
const RequestBodySchema = z.object({
  sourceText: z
    .string()
    .min(10, "Source text must be at least 10 characters long.") // Restore min length validation
    .max(5000, "Source text cannot exceed 5000 characters."),
  count: z
    .number()
    .int()
    .min(1, "Must generate at least 1 flashcard.")
    .max(10, "Cannot generate more than 10 flashcards at once.") // Limituj liczbę generowanych fiszek
    .optional()
    .default(5),
  topicId: z.string().uuid("Invalid Topic ID format."), // Dodajemy topicId do walidacji
});

export const POST: APIRoute = async ({ request }) => {
  try {
    let requestBody;
    try {
      const rawBody = await request.json();
      requestBody = RequestBodySchema.parse(rawBody);
    } catch (error) {
      const details = error instanceof z.ZodError ? error.errors : "Invalid JSON format";
      return new Response(JSON.stringify({ error: "Invalid request body", details }), { status: 400 });
    }

    const { sourceText, count } = requestBody;

    const openRouter = new OpenRouterService(); // Konstruktor rzuci błąd, jeśli brakuje klucza API

    const jsonSchemaString = JSON.stringify(zodToJsonSchema(FlashcardsResponseSchema, "FlashcardsResponse"), null, 2);

    const systemPrompt = `You are an expert in creating concise and effective flashcards for learning. Generate exactly ${count} flashcards based on the provided text. Each flashcard should have a distinct 'front' (a question or term) and 'back' (the answer or definition). Ensure the flashcards accurately reflect the key information in the text. Output the result strictly as a JSON object matching the 'FlashcardsResponse' schema provided below. Do NOT include any introductory text, explanations, or markdown formatting outside the JSON structure.

Schema:
\`\`\`json
${jsonSchemaString}
\`\`\``;

    const userPrompt = `Source Text:\n"""\n${sourceText}\n"""`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const options = {
      responseSchema: FlashcardsResponseSchema,
      schemaName: "FlashcardsResponse",
      temperature: 0.5,
      max_tokens: 200 * count + 500,
    };

    const result = await openRouter.completeChat(messages, options);

    // Return just the flashcards array instead of wrapping it in a success/data structure
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during flashcard generation:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

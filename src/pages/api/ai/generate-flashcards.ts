import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  OpenRouterService,
  OpenRouterAPIError,
  NetworkError,
  SchemaValidationError,
  ResponseParsingError,
  OpenRouterConfigurationError,
  type Message // Import Message type
} from '@/lib/services/openrouter'; // Upewnij się, że ścieżka jest poprawna
import { zodToJsonSchema } from 'zod-to-json-schema'; // Import zodToJsonSchema

// Schemat dla pojedynczej fiszki
const FlashcardSchema = z.object({
  front: z.string().min(1).describe("The front content of the flashcard (question or term)"),
  back: z.string().min(1).describe("The back content of the flashcard (answer or definition)"),
}).describe("A single flashcard with front and back text.");

// Schemat dla odpowiedzi zawierającej listę fiszek
const FlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(1).describe("An array of generated flashcards")
}).describe("A list of generated flashcards based on the source text.");

// Schemat dla ciała żądania POST
const RequestBodySchema = z.object({
  sourceText: z.string()
                         .min(10, "Tekst źródłowy musi mieć co najmniej 10 znaków.") // Restore min length validation
                         .max(5000, "Tekst źródłowy nie może przekraczać 5000 znaków."),
  count: z.number().int().min(1, "Należy wygenerować co najmniej 1 fiszkę.")
                   .max(10, "Nie można wygenerować więcej niż 10 fiszek naraz.") // Limituj liczbę generowanych fiszek
                   .optional().default(5),
  topicId: z.string().uuid("Nieprawidłowy format ID tematu."), // Dodajemy topicId do walidacji
});

export const POST: APIRoute = async ({ request, locals }) => {
  // TODO: Dodać autentykację i autoryzację - upewnić się, że użytkownik jest zalogowany
  // i ma prawo generować fiszki dla tego tematu (jeśli jest to wymagane)
  // const session = await locals.auth.validate();
  // if (!session) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  // }
  // TODO: Sprawdzić, czy temat o podanym topicId należy do zalogowanego użytkownika

  let requestBody;
  try {
    const rawBody = await request.json();
    requestBody = RequestBodySchema.parse(rawBody);
  } catch (error) {
    // Zwracamy błędy walidacji Zod w bardziej czytelny sposób
    const details = error instanceof z.ZodError ? error.errors : 'Nieprawidłowy format JSON';
    return new Response(JSON.stringify({ error: 'Nieprawidłowe ciało żądania', details }), { status: 400 });
  }

  const { sourceText, count, topicId } = requestBody;

  try {
    const openRouter = new OpenRouterService(); // Konstruktor rzuci błąd, jeśli brakuje klucza API

    // Convert FlashcardsResponseSchema to JSON Schema for the prompt
    const jsonSchemaString = JSON.stringify(zodToJsonSchema(FlashcardsResponseSchema, 'FlashcardsResponse'), null, 2);

    const systemPrompt = `You are an expert in creating concise and effective flashcards for learning. Generate exactly ${count} flashcards based on the provided text. Each flashcard should have a distinct 'front' (a question or term) and 'back' (the answer or definition). Ensure the flashcards accurately reflect the key information in the text. Output the result strictly as a JSON object matching the 'FlashcardsResponse' schema provided below. Do NOT include any introductory text, explanations, or markdown formatting outside the JSON structure.

Schema:
\`\`\`json
${jsonSchemaString}
\`\`\``;

    const userPrompt = `Source Text:\n"""\n${sourceText}\n"""`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const options = {
      // Można wybrać model dynamicznie lub użyć domyślnego z serwisu
      // model: 'anthropic/claude-3-haiku-20240307', // Przykładowy szybki model
      responseSchema: FlashcardsResponseSchema,
      schemaName: 'FlashcardsResponse', // Musi pasować do nazwy użytej w zodToJsonSchema
      temperature: 0.5, // Niższa temperatura dla bardziej spójnych wyników
      max_tokens: 200 * count + 500, // Oszacuj max_tokens na podstawie liczby fiszek + margines
    };

    // Typ wyniku jest automatycznie inferowany jako z.infer<typeof FlashcardsResponseSchema>
    const result = await openRouter.completeChat(messages, options);

    // TODO: Zapisz wygenerowane fiszki w bazie danych, powiązane z topicId
    // const supabase = locals.supabase; // Uzyskaj klienta Supabase z locals
    // const flashcardDataToInsert = result.flashcards.map(fc => ({
    //   topic_id: topicId,
    //   front: fc.front,
    //   back: fc.back,
    //   source: 'ai-generated' as const, // Ustaw źródło
    //   user_id: session.user.userId // Powiąż z użytkownikiem
    // }));
    // const { error: dbError } = await supabase.from('flashcards').insert(flashcardDataToInsert);
    // if (dbError) {
    //   console.error('Error saving generated flashcards to DB:', dbError);
    //   // Można zwrócić błąd 500 lub spróbować obsłużyć go inaczej
    //   return new Response(JSON.stringify({ error: 'Failed to save generated flashcards.' }), { status: 500 });
    // }

    // Zwracamy tylko wygenerowane dane, bez zapisywania na razie
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error during flashcard generation:', error); // Logowanie pełnego błędu na serwerze

    let status = 500;
    let message = 'Wystąpił nieoczekiwany błąd podczas generowania fiszek.';
    let details: any = undefined; // Opcjonalne szczegóły dla klienta

    if (error instanceof SchemaValidationError) {
      status = 502; // Bad Gateway - problem z odpowiedzią od LLM
      message = 'Nie udało się przetworzyć odpowiedzi AI: Nieprawidłowy format.';
      // Logujemy szczegóły walidacji, ale nie wysyłamy ich do klienta
      console.error('Schema validation errors:', error.validationErrors);
      details = error.validationErrors; // Można rozważyć wysłanie uproszczonych błędów
    } else if (error instanceof ResponseParsingError) {
      status = 502;
      message = 'Nie udało się sparsować odpowiedzi AI. AI mogło nie zwrócić poprawnego JSON.';
      // Logujemy przyczynę, jeśli istnieje
      if (error.cause) console.error('Parsing cause:', error.cause);
    } else if (error instanceof OpenRouterAPIError) {
      // Mapuj błędy 5xx OpenRouter na 502 (Bad Gateway), 4xx na odpowiedni status (np. 400, 401, 429)
      status = error.statusCode >= 500 ? 502 : error.statusCode;
      message = `Błąd usługi AI: ${error.message}`;
      // Możemy chcieć ukryć niektóre szczegóły błędów API przed klientem
      if (status === 429) message = 'Przekroczono limit zapytań do usługi AI. Spróbuj ponownie później.';
      else if (status === 401) message = 'Uwierzytelnianie usługi AI nie powiodło się. Sprawdź konfigurację klucza API.';
      // Logujemy pełne szczegóły błędu API
      console.error('OpenRouter API Error Details:', error.details);
    } else if (error instanceof NetworkError) {
      status = 504; // Gateway Timeout
      message = 'Błąd sieci podczas łączenia z usługą AI. Sprawdź połączenie lub spróbuj ponownie później.';
    } else if (error instanceof OpenRouterConfigurationError) {
        status = 500; // Błąd konfiguracji serwera
        message = 'Błąd konfiguracji usługi AI. Skontaktuj się z administratorem.';
    } else if (error instanceof Error) {
        // Ogólny błąd JavaScript
        message = `Wystąpił nieoczekiwany błąd: ${error.message}`;
    }

    return new Response(JSON.stringify({ error: message, details }), { status });
  }
};

# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis Usługi

`OpenRouterService` to klasa TypeScript zaprojektowana do interakcji z API OpenRouter. Umożliwia wysyłanie zapytań do różnych modeli językowych (LLM) hostowanych przez OpenRouter, w tym konfigurowanie promptów systemowych i użytkownika, określanie modelu, parametrów oraz wymaganie ustrukturyzowanych odpowiedzi w formacie JSON za pomocą schematów. Usługa będzie częścią backendu aplikacji (np. w endpointach API Astro) i będzie wykorzystywać zmienne środowiskowe do bezpiecznego zarządzania kluczem API.

## 2. Opis Konstruktora

Konstruktor `OpenRouterService` inicjalizuje usługę, pobierając klucz API OpenRouter i opcjonalnie podstawowy URL API oraz domyślną nazwę modelu ze zmiennych środowiskowych.

```typescript
// Potencjalna lokalizacja: src/lib/services/openrouter.ts

import { z } from 'zod';

// Definicje typów dla wiadomości i opcji
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface RequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseSchema?: z.ZodSchema;
  schemaName?: string; // Wymagane jeśli responseSchema jest podane
  // Inne parametry API OpenRouter...
}

interface OpenRouterErrorResponse {
  error: {
    code: string | null;
    message: string;
    type: string;
  };
}

// Definicje niestandardowych błędów
export class OpenRouterConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterConfigurationError';
  }
}

export class OpenRouterAPIError extends Error {
  constructor(message: string, public statusCode: number, public details?: OpenRouterErrorResponse) {
    super(message);
    this.name = 'OpenRouterAPIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ResponseParsingError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ResponseParsingError';
  }
}

export class SchemaValidationError extends Error {
  constructor(message: string, public validationErrors: z.ZodIssue[]) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}


export class OpenRouterService {
  private apiKey: string;
  private apiUrl: string;
  private defaultModel: string;

  constructor() {
    // W Astro, użyj import.meta.env dla zmiennych środowiskowych
    // Upewnij się, że zmienne są zdefiniowane w .env i mają prefix PUBLIC_, jeśli są używane po stronie klienta,
    // lub są dostępne bezpośrednio, jeśli używane tylko na serwerze (np. w endpointach API).
    // Dla klucza API używanego tylko na serwerze, nie jest potrzebny prefix PUBLIC_.
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    const apiUrl = import.meta.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
    const defaultModel = import.meta.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-3.5-turbo'; // Przykładowy domyślny model

    if (!apiKey) {
      throw new OpenRouterConfigurationError('Missing OPENROUTER_API_KEY environment variable.');
    }

    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.defaultModel = defaultModel;
  }

  // ... metody publiczne i prywatne
}
```

## 3. Publiczne Metody i Pola

### `async completeChat<T extends z.ZodSchema | undefined = undefined>(messages: Message[], options?: RequestOptions & { responseSchema?: T }): Promise<T extends z.ZodSchema ? z.infer<T> : string>`

Główna metoda do wysyłania zapytania do modelu LLM.

*   **Parametry:**
    *   `messages`: `Message[]` - Tablica obiektów wiadomości (`{ role: 'system' | 'user' | 'assistant', content: string }`). Musi zawierać co najmniej jedną wiadomość użytkownika.
    *   `options`: `RequestOptions` (opcjonalny) - Obiekt konfiguracyjny:
        *   `model`: `string` - Nazwa modelu do użycia (np. `'openai/gpt-4o'`). Domyślnie używa `this.defaultModel`.
        *   `temperature`: `number` - Parametr kontrolujący losowość odpowiedzi.
        *   `max_tokens`: `number` - Maksymalna liczba tokenów w odpowiedzi.
        *   `responseSchema`: `z.ZodSchema` - Schemat Zod definiujący oczekiwaną strukturę odpowiedzi JSON. Jeśli podany, usługa zażąda formatu JSON i zwaliduje odpowiedź.
        *   `schemaName`: `string` - Nazwa dla schematu JSON (wymagana, jeśli `responseSchema` jest podany).
        *   Inne parametry API OpenRouter.
*   **Zwraca:**
    *   `Promise<z.infer<T>>`: Jeśli `responseSchema` zostało podane, zwraca Promise z obiektem zwalidowanym według schematu.
    *   `Promise<string>`: Jeśli `responseSchema` nie zostało podane, zwraca Promise z odpowiedzią tekstową modelu.
*   **Rzuca:** `OpenRouterConfigurationError`, `OpenRouterAPIError`, `NetworkError`, `ResponseParsingError`, `SchemaValidationError`.

## 4. Prywatne Metody i Pola

### `private apiKey: string`

Przechowuje klucz API OpenRouter.

### `private apiUrl: string`

Przechowuje bazowy URL API OpenRouter.

### `private defaultModel: string`

Przechowuje domyślną nazwę modelu do użycia.

### `private buildRequestBody(messages: Message[], options?: RequestOptions): Record<string, any>`

Buduje obiekt ciała żądania na podstawie wiadomości i opcji. Obsługuje tworzenie `response_format` na podstawie `responseSchema`.

### `private async makeRequest(requestBody: Record<string, any>): Promise<Response>`

Wykonuje żądanie `fetch` do API OpenRouter z odpowiednimi nagłówkami i obsługą podstawowych błędów sieciowych/HTTP.

### `private parseAndValidateResponse<T extends z.ZodSchema | undefined>(response: Response, schema?: T): Promise<T extends z.ZodSchema ? z.infer<T> : string>`

Parsuje odpowiedź JSON, obsługuje błędy API zwrócone w ciele odpowiedzi i waliduje ją względem schematu (jeśli został podany).

## 5. Obsługa Błędów

Usługa implementuje szczegółową obsługę błędów przy użyciu niestandardowych klas błędów:

1.  **`OpenRouterConfigurationError`**: Rzucany przez konstruktor, jeśli brakuje klucza API w zmiennych środowiskowych.
2.  **`NetworkError`**: Rzucany przez `makeRequest`, jeśli wystąpi błąd sieciowy (np. `fetch` zawiedzie).
3.  **`OpenRouterAPIError`**: Rzucany przez `parseAndValidateResponse`, jeśli API OpenRouter zwróci błąd HTTP (status >= 400). Zawiera status kod i potencjalnie szczegóły błędu z odpowiedzi API.
4.  **`ResponseParsingError`**: Rzucany przez `parseAndValidateResponse`, jeśli odpowiedź API nie jest poprawnym JSON-em lub wystąpi inny błąd podczas parsowania.
5.  **`SchemaValidationError`**: Rzucany przez `parseAndValidateResponse`, jeśli `responseSchema` zostało podane, ale odpowiedź API nie przeszła walidacji Zod. Zawiera szczegóły błędów walidacji.

Logika wywołująca usługę powinna implementować bloki `try...catch` do obsługi tych błędów i odpowiedniego reagowania (np. logowanie, zwracanie błędu do klienta).

## 6. Kwestie Bezpieczeństwa

1.  **Klucz API**: Klucz API OpenRouter (`OPENROUTER_API_KEY`) **musi** być przechowywany jako sekret w zmiennych środowiskowych i **nigdy** nie powinien być ujawniany po stronie klienta ani hardkodowany w kodzie. Używaj mechanizmów zarządzania sekretami dostarczanych przez platformę hostingową (np. DigitalOcean App Platform secrets, Vercel Environment Variables). W Astro, dostęp do zmiennych środowiskowych bez prefixu `PUBLIC_` jest bezpieczny tylko w kodzie wykonywanym na serwerze (np. endpointy API, `getStaticPaths`, middleware).
2.  **Walidacja Wejścia**: Chociaż usługa nie waliduje bezpośrednio treści promptów, logika aplikacji wywołująca usługę powinna walidować i sanityzować wszelkie dane wejściowe od użytkownika przed przekazaniem ich do `OpenRouterService`, aby zapobiec atakom typu prompt injection.
3.  **Limity Zasobów**: Rozważ implementację limitów po stronie aplikacji (np. maksymalna długość promptu, liczba zapytań na użytkownika) w celu kontroli kosztów i zapobiegania nadużyciom. OpenRouter również oferuje ustawianie limitów budżetowych.
4.  **Logowanie**: Loguj błędy i ważne zdarzenia, ale unikaj logowania wrażliwych danych, takich jak pełne prompty użytkowników, jeśli nie jest to absolutnie konieczne i zgodne z polityką prywatności.

## 7. Plan Wdrożenia Krok po Kroku

1.  **Konfiguracja Środowiska**:
    *   Dodaj `OPENROUTER_API_KEY` do zmiennych środowiskowych projektu (np. w pliku `.env` dla lokalnego rozwoju i w ustawieniach sekretów platformy hostingowej dla produkcji).
    *   Opcjonalnie dodaj `OPENROUTER_API_URL` i `OPENROUTER_DEFAULT_MODEL`, jeśli chcesz nadpisać wartości domyślne.
    *   Upewnij się, że zmienne środowiskowe są dostępne w kontekście serwerowym Astro (np. w `src/pages/api/...`).

2.  **Instalacja Zależności**:
    *   Zainstaluj `zod` i `zod-to-json-schema`, jeśli jeszcze ich nie ma w projekcie.
    ```bash
    npm install zod zod-to-json-schema
    # lub yarn add zod zod-to-json-schema
    # lub pnpm add zod zod-to-json-schema
    ```

3.  **Utworzenie Pliku Usługi**:
    *   Utwórz plik `src/lib/services/openrouter.ts`.
    *   Zaimplementuj klasy błędów (`OpenRouterConfigurationError`, `OpenRouterAPIError`, `NetworkError`, `ResponseParsingError`, `SchemaValidationError`) zgodnie z sekcją 2.

4.  **Implementacja Konstruktora**:
    *   Zaimplementuj konstruktor klasy `OpenRouterService`, który odczytuje zmienne środowiskowe (`import.meta.env`) i inicjalizuje pola `apiKey`, `apiUrl`, `defaultModel`. Rzuć `OpenRouterConfigurationError`, jeśli brakuje klucza API.

5.  **Implementacja Metod Prywatnych**:
    *   **`buildRequestBody`**:
        *   Przyjmuje `messages` i `options`.
        *   Ustawia `model` (używając `options.model` lub `this.defaultModel`).
        *   Kopiuje inne parametry z `options` (np. `temperature`, `max_tokens`).
        *   Jeśli `options.responseSchema` i `options.schemaName` są podane:
            *   Użyj `zodToJsonSchema` do konwersji `options.responseSchema` na JSON Schema.
            *   Skonstruuj obiekt `response_format` zgodnie ze specyfikacją OpenRouter (patrz przykład w Implementation Breakdown).
            *   Dodaj `response_format` do ciała żądania.
        *   Zwraca gotowy obiekt ciała żądania.
    *   **`makeRequest`**:
        *   Przyjmuje `requestBody`.
        *   Używa globalnego `fetch` do wysłania żądania POST na `this.apiUrl + '/chat/completions'`.
        *   Ustawia nagłówki:
            *   `Authorization: Bearer ${this.apiKey}`
            *   `Content-Type: application/json`
            *   `HTTP-Referer: YOUR_SITE_URL` (zalecane przez OpenRouter)
            *   `X-Title: YOUR_APP_NAME` (zalecane przez OpenRouter)
        *   Obsługuje błędy `fetch` w bloku `try...catch`, rzucając `NetworkError`.
        *   Zwraca obiekt `Response`.
    *   **`parseAndValidateResponse`**:
        *   Przyjmuje `response: Response` i opcjonalnie `schema: z.ZodSchema`.
        *   Sprawdza `response.ok`. Jeśli `false`:
            *   Próbuje sparsować ciało błędu jako JSON (`OpenRouterErrorResponse`).
            *   Rzuca `OpenRouterAPIError` ze statusem, wiadomością i opcjonalnie szczegółami błędu.
        *   Próbuje sparsować ciało sukcesu jako JSON (`response.json()`). W razie błędu rzuca `ResponseParsingError`.
        *   Jeśli `schema` zostało podane:
            *   Wyodrębnia treść z odpowiedzi (zwykle `data.choices[0].message.content`).
            *   Próbuje sparsować tę treść jako JSON (ponieważ model zwraca JSON jako string wewnątrz `content`). W razie błędu rzuca `ResponseParsingError`.
            *   Używa `schema.safeParse()` do walidacji sparsowanego obiektu JSON.
            *   Jeśli walidacja nie powiedzie się (`!result.success`), rzuca `SchemaValidationError` z `result.error.issues`.
            *   Jeśli walidacja się powiedzie, zwraca `result.data`.
        *   Jeśli `schema` nie zostało podane:
            *   Wyodrębnia i zwraca treść tekstową z odpowiedzi (zwykle `data.choices[0].message.content`).

6.  **Implementacja Metody Publicznej `completeChat`**:
    *   Wywołuje `buildRequestBody` z podanymi `messages` i `options`.
    *   Wywołuje `makeRequest` z wynikiem `buildRequestBody`.
    *   Wywołuje `parseAndValidateResponse` z odpowiedzią z `makeRequest` i `options.responseSchema`.
    *   Zwraca wynik `parseAndValidateResponse`.

7.  **Użycie Usługi w Endpoincie API Astro**:
    *   Utwórz endpoint API, np. `src/pages/api/ai/generate.ts`.
    *   Zaimportuj `OpenRouterService` i ewentualnie schematy Zod.
    *   W funkcji obsługi żądania (np. `POST`):
        *   Utwórz instancję `const openRouter = new OpenRouterService();`.
        *   Pobierz dane wejściowe z żądania (np. prompt użytkownika, opcje). Pamiętaj o walidacji i sanityzacji danych wejściowych!
        *   Przygotuj tablicę `messages` (np. dodając prompt systemowy).
        *   Zdefiniuj `RequestOptions`, w tym `responseSchema` i `schemaName`, jeśli potrzebujesz ustrukturyzowanej odpowiedzi.
        *   Wywołaj `openRouter.completeChat(messages, options)` w bloku `try...catch`.
        *   Obsłuż potencjalne błędy (logowanie, zwracanie odpowiedniego statusu HTTP i komunikatu błędu do klienta).
        *   Zwróć pomyślną odpowiedź (wygenerowany tekst lub obiekt JSON) do klienta.

```typescript
// Przykład użycia w src/pages/api/ai/generate-flashcards.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { OpenRouterService, OpenRouterAPIError, NetworkError, SchemaValidationError, ResponseParsingError, OpenRouterConfigurationError } from '@/lib/services/openrouter'; // Dostosuj ścieżkę

// Schemat dla pojedynczej fiszki
const FlashcardSchema = z.object({
  front: z.string().min(1).describe("The front content of the flashcard"),
  back: z.string().min(1).describe("The back content of the flashcard"),
}).describe("A single flashcard with front and back text.");

// Schemat dla odpowiedzi zawierającej listę fiszek
const FlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(1).describe("An array of generated flashcards")
}).describe("A list of generated flashcards based on the source text.");

// Schemat dla ciała żądania POST
const RequestBodySchema = z.object({
  sourceText: z.string().min(10).max(5000), // Przykładowa walidacja
  count: z.number().int().min(1).max(10).optional().default(5),
});

export const POST: APIRoute = async ({ request }) => {
  let requestBody;
  try {
    const rawBody = await request.json();
    requestBody = RequestBodySchema.parse(rawBody);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body', details: error instanceof z.ZodError ? error.errors : null }), { status: 400 });
  }

  const { sourceText, count } = requestBody;

  try {
    const openRouter = new OpenRouterService(); // Konstruktor rzuci błąd, jeśli brakuje klucza API

    const systemPrompt = `You are an expert in creating concise and effective flashcards for learning. Generate exactly ${count} flashcards based on the provided text. Each flashcard should have a distinct 'front' (a question or term) and 'back' (the answer or definition). Ensure the flashcards accurately reflect the key information in the text. Output the result as a JSON object matching the 'FlashcardsResponse' schema.`;
    const userPrompt = `Source Text:\n"""\n${sourceText}\n"""`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const options = {
      // Można wybrać model dynamicznie lub użyć domyślnego
      // model: 'anthropic/claude-3-haiku-20240307',
      responseSchema: FlashcardsResponseSchema,
      schemaName: 'FlashcardsResponse', // Musi pasować do nazwy w schemacie Zod -> JSON
      temperature: 0.5,
      max_tokens: 1500, // Dostosuj w razie potrzeby
    };

    // Typ wyniku jest automatycznie inferowany jako z.infer<typeof FlashcardsResponseSchema>
    const result = await openRouter.completeChat(messages, options);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error calling OpenRouter API:', error); // Logowanie błędu na serwerze

    let status = 500;
    let message = 'Internal Server Error';

    if (error instanceof SchemaValidationError) {
      status = 502; // Bad Gateway - problem z odpowiedzią od upstream (LLM nie zwrócił poprawnego JSON)
      message = 'Failed to process AI response (schema validation failed).';
      // Można dodać szczegóły walidacji do logów, ale niekoniecznie do odpowiedzi klienta
      console.error('Schema validation errors:', error.validationErrors);
    } else if (error instanceof ResponseParsingError) {
      status = 502;
      message = 'Failed to parse AI response.';
    } else if (error instanceof OpenRouterAPIError) {
      status = error.statusCode >= 500 ? 502 : error.statusCode; // Mapuj błędy 5xx OpenRouter na 502
      message = `AI service error: ${error.message}`;
    } else if (error instanceof NetworkError) {
      status = 504; // Gateway Timeout
      message = 'Network error connecting to AI service.';
    } else if (error instanceof OpenRouterConfigurationError) {
        status = 500; // Błąd konfiguracji serwera
        message = 'AI service configuration error.';
    }

    return new Response(JSON.stringify({ error: message }), { status });
  }
};
```

8.  **Testowanie**:
    *   Napisz testy jednostkowe dla `OpenRouterService`, mockując `fetch` i zmienne środowiskowe.
    *   Przetestuj endpoint API ręcznie (np. używając `curl` lub narzędzi typu Postman/Insomnia) oraz automatycznie (jeśli masz testy integracyjne/E2E). Przetestuj przypadki sukcesu i różne scenariusze błędów.

9.  **Refaktoryzacja i Poprawki**:
    *   Przejrzyj kod pod kątem zgodności z zasadami czystego kodu (`.cursor/rules/shared.mdc`).
    *   Zastosuj feedback z linterów.
    *   Upewnij się, że obsługa błędów jest spójna i dostarcza wystarczających informacji do debugowania.

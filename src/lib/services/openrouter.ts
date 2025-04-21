import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Definicje typów dla wiadomości i opcji
export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface RequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseSchema?: z.ZodSchema;
  schemaName?: string; // Wymagane jeśli responseSchema jest podane
  // TODO: Dodać inne wspierane parametry API OpenRouter (np. top_p, frequency_penalty, etc.)
}

// Typ dla struktury błędu zwracanego przez API OpenRouter
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
    // Utrzymanie poprawnego śladu stosu
    Object.setPrototypeOf(this, OpenRouterConfigurationError.prototype);
  }
}

export class OpenRouterAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: OpenRouterErrorResponse['error'] // Używamy zagnieżdżonego typu błędu
  ) {
    super(message);
    this.name = 'OpenRouterAPIError';
    Object.setPrototypeOf(this, OpenRouterAPIError.prototype);
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ResponseParsingError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ResponseParsingError';
    Object.setPrototypeOf(this, ResponseParsingError.prototype);
  }
}

export class SchemaValidationError extends Error {
  constructor(message: string, public validationErrors: z.ZodIssue[]) {
    super(message);
    this.name = 'SchemaValidationError';
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }
}


export class OpenRouterService {
  private apiKey: string;
  private apiUrl: string;
  private defaultModel: string;
  // TODO: Rozważyć dodanie SITE_URL i APP_NAME do zmiennych środowiskowych
  private siteUrl: string = 'http://localhost:4321'; // Placeholder - pobrać z env
  private appName: string = 'FlashcardApp'; // Placeholder - pobrać z env

  constructor() {
    // W Astro, użyj import.meta.env dla zmiennych środowiskowych na serwerze
    const apiKey = import.meta.env.APP_OPENROUTER_API_KEY;
    // Używamy || '' aby uniknąć błędu typu, jeśli zmienna nie jest ustawiona, ale sprawdzamy to poniżej
    const apiUrl = import.meta.env.APP_OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
    const defaultModel = import.meta.env.APP_OPENROUTER_DEFAULT_MODEL || 'openai/gpt-3.5-turbo';

    if (!apiKey) {
      console.error("Missing APP_OPENROUTER_API_KEY environment variable.");
      throw new OpenRouterConfigurationError('Missing APP_OPENROUTER_API_KEY environment variable.');
    }

    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.defaultModel = defaultModel;

    // Można też wczytać siteUrl i appName z env, jeśli zdefiniowane
    // this.siteUrl = import.meta.env.APP_SITE_URL || this.siteUrl;
    // this.appName = import.meta.env.APP_NAME || this.appName;
  }

  private buildRequestBody(messages: Message[], options?: RequestOptions): Record<string, any> {
    const body: Record<string, any> = {
      model: options?.model || this.defaultModel,
      messages: messages,
    };

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }
    if (options?.max_tokens !== undefined) {
      body.max_tokens = options.max_tokens;
    }
    // TODO: Dodać mapowanie innych opcji z RequestOptions do ciała żądania

    if (options?.responseSchema && options?.schemaName) {
      try {
        const jsonSchema = zodToJsonSchema(options.responseSchema, options.schemaName);
        body.response_format = {
          type: 'json_object',
          // OpenRouter oczekuje schematu JSON wewnątrz pola 'json_schema'
          // Zgodnie z dokumentacją: https://openrouter.ai/docs#json-mode
          // Uwaga: zodToJsonSchema generuje pełny schemat, w tym "$schema", "type": "object" itp.
          // Upewnijmy się, że przekazujemy właściwą strukturę.
          // zodToJsonSchema zwraca obiekt, który powinien być kompatybilny.
          json_schema: jsonSchema
        };
      } catch (error) {
        // Rzucenie błędu konfiguracji, jeśli schemat jest nieprawidłowy
        // Chociaż zodToJsonSchema rzadko rzuca błędy dla poprawnych schematów Zod.
        console.error("Error converting Zod schema to JSON schema:", error);
        throw new OpenRouterConfigurationError(`Invalid response schema provided for '${options.schemaName}'.`);
      }
    } else if (options?.responseSchema && !options?.schemaName) {
        throw new OpenRouterConfigurationError("schemaName is required when responseSchema is provided.");
    }


    return body;
  }

  private async makeRequest(requestBody: Record<string, any>): Promise<Response> {
    const url = `${this.apiUrl}/chat/completions`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.siteUrl, // Zalecane przez OpenRouter
      'X-Title': this.appName,      // Zalecane przez OpenRouter
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(requestBody),
      });
      return response;
    } catch (error) {
      console.error('Network error during fetch to OpenRouter:', error);
      // Rzucamy niestandardowy błąd, przekazując oryginalny błąd jako przyczynę
      throw new NetworkError('Failed to connect to OpenRouter API.', error);
    }
  }

  private async parseAndValidateResponse<T extends z.ZodSchema | undefined>(
    response: Response,
    schema?: T
  ): Promise<T extends z.ZodSchema ? z.infer<T> : string> {
    let responseData: any;

    // Sprawdzenie statusu odpowiedzi
    if (!response.ok) {
      let errorDetails: OpenRouterErrorResponse['error'] | undefined;
      let errorMessage = `OpenRouter API Error: ${response.status} ${response.statusText}`;
      try {
        // Spróbuj sparsować ciało błędu, może zawierać więcej informacji
        const errorBody = await response.json();
        if (errorBody && typeof errorBody === 'object' && 'error' in errorBody) {
          errorDetails = (errorBody as OpenRouterErrorResponse).error;
          errorMessage = `OpenRouter API Error: ${errorDetails?.message || errorMessage}`;
        }
      } catch (parseError) {
        // Ignoruj błąd parsowania ciała błędu, użyj domyślnej wiadomości
        console.warn('Could not parse error response body:', parseError);
      }
      throw new OpenRouterAPIError(errorMessage, response.status, errorDetails);
    }

    // Parsowanie ciała odpowiedzi sukcesu
    try {
      responseData = await response.json();
    } catch (error) {
      console.error('Error parsing JSON response from OpenRouter:', error);
      throw new ResponseParsingError('Failed to parse JSON response from OpenRouter API.', error);
    }

    // Wyodrębnienie treści wiadomości
    // Standardowa odpowiedź OpenRouter/OpenAI ma strukturę: { choices: [{ message: { content: "..." } }] }
    const messageContent = responseData?.choices?.[0]?.message?.content;

    if (typeof messageContent !== 'string') {
        console.error('Invalid response structure from OpenRouter:', responseData);
        throw new ResponseParsingError('Invalid response structure: message content not found or not a string.');
    }

    // Walidacja schematem, jeśli został podany
    if (schema) {
      let parsedJsonContent: any;
      try {
        // Extract JSON from potential markdown code blocks
        let jsonContent = messageContent;
        
        // Check if content is wrapped in markdown code blocks
        const jsonBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
        const match = jsonBlockRegex.exec(messageContent);
        if (match && match[1]) {
          jsonContent = match[1];
        }
        
        parsedJsonContent = JSON.parse(jsonContent);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${error.message}`);
        } else if (error instanceof SyntaxError) {
          console.error("Raw message content:", messageContent);
          throw new ResponseParsingError("Failed to parse message content as JSON. The AI might not have returned valid JSON.");
        }
        throw error;
      }

      const validationResult = schema.safeParse(parsedJsonContent);

      if (!validationResult.success) {
        console.error('Schema validation failed:', validationResult.error.issues);
        console.error('Parsed JSON content that failed validation:', parsedJsonContent); // Logujemy obiekt, który nie przeszedł walidacji
        throw new SchemaValidationError(
          'Response validation failed against the provided schema.',
          validationResult.error.issues
        );
      }
      // Zwracamy zwalidowane dane
      return validationResult.data as z.infer<T>;
    } else {
      // Zwracamy surową treść tekstową, jeśli schemat nie był wymagany
      return messageContent as (T extends z.ZodSchema ? never : string);
    }
  }

  /**
   * Główna metoda do wysyłania zapytania do modelu LLM.
   * @param messages Tablica obiektów wiadomości.
   * @param options Opcje żądania, w tym model, parametry i opcjonalny schemat odpowiedzi Zod.
   * @returns Promise z obiektem zwalidowanym według schematu (jeśli podano responseSchema) lub string z odpowiedzią tekstową.
   * @throws {OpenRouterConfigurationError} Błąd konfiguracji (np. brak klucza API).
   * @throws {NetworkError} Błąd połączenia sieciowego z API.
   * @throws {OpenRouterAPIError} Błąd zwrócony przez API OpenRouter (np. 4xx, 5xx).
   * @throws {ResponseParsingError} Błąd parsowania odpowiedzi API (np. nieprawidłowy JSON).
   * @throws {SchemaValidationError} Błąd walidacji odpowiedzi względem podanego schematu Zod.
   */
  public async completeChat<T extends z.ZodSchema | undefined = undefined>(
    messages: Message[],
    options?: RequestOptions & { responseSchema?: T }
  ): Promise<T extends z.ZodSchema ? z.infer<T> : string> {
    // Sprawdzenie podstawowe - czy są jakieś wiadomości
    if (!messages || messages.length === 0) {
        throw new OpenRouterConfigurationError("Messages array cannot be empty.");
    }
    // Można dodać bardziej szczegółową walidację wiadomości, np. czy jest rola 'user'

    const requestBody = this.buildRequestBody(messages, options);
    const response = await this.makeRequest(requestBody);
    // Przekazujemy responseSchema do metody parseAndValidateResponse
    return this.parseAndValidateResponse(response, options?.responseSchema);
  }
}


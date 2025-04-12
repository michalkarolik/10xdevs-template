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

  // Metoda parseAndValidateResponse zostanie zaimplementowana w Kroku 5 (część 2)
  // Metoda publiczna completeChat zostanie zaimplementowana w Kroku 6
}

import { z } from 'zod';

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
  // Pola zostaną zdefiniowane w konstruktorze (Krok 4)

  constructor() {
    // Implementacja w Kroku 4
  }

  // Metody publiczne i prywatne zostaną zaimplementowane w kolejnych krokach
}

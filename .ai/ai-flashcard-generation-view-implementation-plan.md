# Plan implementacji widoku: Generowanie Fiszek AI

## 1. Przegląd
Widok "Generowanie Fiszek AI" umożliwia użytkownikom wklejenie tekstu źródłowego i wygenerowanie propozycji fiszek (awers/rewers) przy użyciu AI. Użytkownik może następnie przejrzeć wygenerowane propozycje, zaakceptować je, poprosić o alternatywne wersje lub edytować przed zapisaniem w ramach wybranego tematu. Widok egzekwuje limity znaków dla fiszek i obsługuje stany ładowania oraz błędy.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/topics/:id/generate`, gdzie `:id` jest identyfikatorem tematu, do którego będą dodawane zaakceptowane fiszki.

## 3. Struktura komponentów
```
AIGenerationView (Komponent strony React w Astro)
  ├── SourceTextInput (React)
  │   ├── Textarea (Shadcn/ui)
  │   └── Button (Shadcn/ui - "Generuj")
  └── GeneratedFlashcardsDisplay (React)
      ├── LoadingIndicator (np. Spinner z Shadcn/ui)
      ├── ErrorMessage (np. Alert z Shadcn/ui)
      ├── EmptyStateMessage
      └── FlashcardSuggestionCard[] (React, mapowane ze stanu)
          ├── Card (Shadcn/ui)
          │   ├── CardHeader/Content (Wyświetlanie front/back)
          │   ├── LimitExceededWarning (Warunkowe, np. AlertDestructive z Shadcn/ui)
          │   ├── CardFooter (Przyciski akcji)
          │   │   ├── Button (Shadcn/ui - "OK")
          │   │   ├── Button (Shadcn/ui - "Wygeneruj nową")
          │   │   └── Button (Shadcn/ui - "Edytuj" / "Anuluj")
          │   └── FlashcardEditForm (Warunkowe, React)
          │       ├── Textarea (Shadcn/ui - Front)
          │       ├── Textarea (Shadcn/ui - Back)
          │       ├── CharacterCounters (Wyświetlanie liczników znaków)
          │       └── Button (Shadcn/ui - "Zapisz")
          │       └── Button (Shadcn/ui - "Anuluj")
```

## 4. Szczegóły komponentów

### `AIGenerationView` (Komponent strony)
- **Opis:** Główny kontener widoku, renderowany przez Astro z dyrektywą `client:load`. Odpowiedzialny za pobranie `topicId` z parametrów ścieżki URL i zarządzanie ogólnym stanem (ładowanie, błędy, dane wejściowe, sugestie) za pomocą customowego hooka `useAIGeneration`.
- **Główne elementy:** `SourceTextInput`, `GeneratedFlashcardsDisplay`.
- **Obsługiwane interakcje:** Inicjuje pobieranie `topicId`, przekazuje stan i handlery do komponentów podrzędnych.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji.
- **Typy:** `topicId: string`.
- **Propsy:** Otrzymuje `topicId` z Astro (`Astro.params.id`).

### `SourceTextInput`
- **Opis:** Komponent zawierający pole tekstowe (`Textarea`) do wklejania tekstu źródłowego oraz przycisk "Generuj".
- **Główne elementy:** `Textarea` (Shadcn/ui), `Button` (Shadcn/ui).
- **Obsługiwane interakcje:** Aktualizacja tekstu źródłowego, kliknięcie przycisku "Generuj".
- **Obsługiwana walidacja:** Przycisk "Generuj" powinien być nieaktywny, jeśli pole tekstowe jest puste.
- **Typy:** `sourceText: string`, `isLoading: boolean`.
- **Propsy:**
    - `sourceText: string`
    - `onSourceTextChange: (text: string) => void`
    - `onGenerateClick: () => void`
    *   `isLoading: boolean` (do dezaktywacji przycisku podczas generowania)

### `GeneratedFlashcardsDisplay`
- **Opis:** Wyświetla listę wygenerowanych sugestii fiszek (`FlashcardSuggestionCard`). Obsługuje również wyświetlanie wskaźnika ładowania, komunikatów o błędach lub informacji o braku sugestii.
- **Główne elementy:** `LoadingIndicator`, `ErrorMessage`, `EmptyStateMessage`, lista `FlashcardSuggestionCard`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji, renderuje listę kart.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `suggestions: FlashcardSuggestionViewModel[]`, `isLoading: boolean`, `error: string | null`.
- **Propsy:**
    - `suggestions: FlashcardSuggestionViewModel[]`
    - `isLoading: boolean` (do wyświetlania wskaźnika ładowania)
    - `error: string | null` (do wyświetlania komunikatu błędu)
    - `onAccept: (suggestionId: string) => void`
    - `onRegenerate: (suggestionId: string) => void`
    - `onEditToggle: (suggestionId: string) => void`
    - `onSaveEdit: (suggestionId: string, editedFront: string, editedBack: string) => void`
    - `onCancelEdit: (suggestionId: string) => void`

### `FlashcardSuggestionCard`
- **Opis:** Wyświetla pojedynczą sugestię fiszki AI (awers i rewers). Zawiera przyciski akcji ("OK", "Wygeneruj nową", "Edytuj"). Wskazuje, jeśli sugestia przekracza limity znaków. Może przełączyć się w tryb edycji (`FlashcardEditForm`).
- **Główne elementy:** `Card`, `CardHeader`, `CardContent`, `CardFooter` (Shadcn/ui), warunkowo `AlertDestructive` (Shadcn/ui) dla ostrzeżenia o limicie, warunkowo `FlashcardEditForm`. Przyciski `Button` (Shadcn/ui).
- **Obsługiwane interakcje:** Kliknięcie "OK", "Wygeneruj nową", "Edytuj", "Anuluj" (w trybie edycji).
- **Obsługiwana walidacja:**
    - Przycisk "OK" jest nieaktywny, jeśli `suggestion.exceeds_limit` jest `true` i komponent nie jest w trybie edycji.
    - Przekazuje walidację limitów do `FlashcardEditForm`.
- **Typy:** `suggestion: FlashcardSuggestionViewModel`. Używa `FLASHCARD_LIMITS`.
- **Propsy:**
    - `suggestion: FlashcardSuggestionViewModel`
    - `onAccept: (suggestionId: string) => void`
    - `onRegenerate: (suggestionId: string) => void`
    - `onEditToggle: (suggestionId: string) => void`
    - `onSaveEdit: (suggestionId: string, editedFront: string, editedBack: string) => void`
    - `onCancelEdit: (suggestionId: string) => void`

### `FlashcardEditForm`
- **Opis:** Formularz wyświetlany wewnątrz `FlashcardSuggestionCard` po kliknięciu "Edytuj". Zawiera pola tekstowe dla awersu i rewersu, liczniki znaków oraz przyciski "Zapisz" i "Anuluj".
- **Główne elementy:** Dwa komponenty `Textarea` (Shadcn/ui), elementy tekstowe dla liczników znaków, dwa przyciski `Button` (Shadcn/ui).
- **Obsługiwane interakcje:** Edycja tekstu w polach, kliknięcie "Zapisz", kliknięcie "Anuluj".
- **Obsługiwana walidacja:**
    - Wyświetla aktualną liczbę znaków dla pól awersu i rewersu.
    - Porównuje liczbę znaków z `FLASHCARD_LIMITS.FRONT_MAX_LENGTH` (100) i `FLASHCARD_LIMITS.BACK_MAX_LENGTH` (500).
    - Przycisk "Zapisz" jest nieaktywny, jeśli którekolwiek z pól przekracza limit znaków lub jest puste.
- **Typy:** Używa `FLASHCARD_LIMITS`. Przechowuje lokalny stan edytowanego tekstu.
- **Propsy:**
    - `initialFront: string`
    - `initialBack: string`
    - `onSave: (editedFront: string, editedBack: string) => void`
    - `onCancel: () => void`

## 5. Typy

Oprócz istniejących typów DTO z `src/types.ts` (takich jak `FlashcardGenerateDto`, `FlashcardGeneratedDto`, `FlashcardAcceptDto` itp.), wprowadzony zostanie następujący ViewModel:

- **`FlashcardSuggestionViewModel`**:
    - **Cel:** Reprezentuje stan pojedynczej sugestii fiszki w interfejsie użytkownika, włączając jej treść, status przekroczenia limitu, stan edycji oraz unikalny identyfikator po stronie klienta.
    - **Pola:**
        - `id: string`: Tymczasowy, unikalny identyfikator po stronie klienta (np. `crypto.randomUUID()`) do zarządzania stanem przed zapisem.
        - `front: string`: Aktualny tekst awersu (może być edytowany).
        - `back: string`: Aktualny tekst rewersu (może być edytowany).
        - `exceeds_limit: boolean`: Wskazuje, czy *oryginalnie* wygenerowana treść przekraczała limity LUB czy *aktualnie edytowana* treść je przekracza.
        - `isEditing: boolean`: Flaga kontrolująca tryb wyświetlania vs. edycji.
        - `originalFront?: string`: Przechowuje oryginalny tekst awersu na potrzeby regeneracji lub anulowania edycji.
        - `originalBack?: string`: Przechowuje oryginalny tekst rewersu na potrzeby regeneracji lub anulowania edycji.

## 6. Zarządzanie stanem

Zalecane jest użycie customowego hooka React, np. `useAIGeneration(topicId: string)`, do enkapsulacji logiki i stanu widoku.

- **Hook `useAIGeneration` zarządzałby:**
    - `sourceText: string`: Tekst źródłowy z `SourceTextInput`.
    - `suggestions: FlashcardSuggestionViewModel[]`: Lista sugestii fiszek.
    - `isLoading: boolean`: Globalny stan ładowania dla operacji API (generowanie, akceptacja, regeneracja). Można rozważyć bardziej granularne stany ładowania per sugestia.
    - `error: string | null`: Komunikat o błędzie.
- **Hook eksponowałby:**
    - Wartości stanu (`sourceText`, `suggestions`, `isLoading`, `error`).
    - Funkcje do aktualizacji stanu (`setSourceText`).
    - Handlery do interakcji użytkownika:
        - `handleGenerate()`: Wywołuje API generowania.
        - `handleAccept(suggestionId: string)`: Wywołuje API akceptacji.
        - `handleRegenerate(suggestionId: string)`: Wywołuje API regeneracji alternatywnej.
        - `handleEditToggle(suggestionId: string)`: Przełącza flagę `isEditing` dla sugestii.
        - `handleSaveEdit(suggestionId: string, editedFront: string, editedBack: string)`: Wywołuje API akceptacji edytowanej wersji.
        - `handleCancelEdit(suggestionId: string)`: Anuluje tryb edycji, przywracając oryginalną treść.

## 7. Integracja API

Komponenty będą komunikować się z API backendu poprzez funkcje wywołujące `fetch` (lub inną bibliotekę HTTP) wewnątrz hooka `useAIGeneration`.

- **Generowanie:**
    - **Trigger:** `handleGenerate()` po kliknięciu "Generuj".
    - **Wywołanie:** `POST /api/topics/{topicId}/generate`
    - **Request Body:** `FlashcardGenerateDto` (`{ source_text: sourceText }`)
    - **Response:** `FlashcardGeneratedResponseDto` (`FlashcardGeneratedDto[]`)
    - **Obsługa:** Aktualizacja stanu `suggestions` (mapowanie odpowiedzi na `FlashcardSuggestionViewModel`), `isLoading`, `error`.
- **Akceptacja ("OK"):**
    - **Trigger:** `handleAccept(suggestionId)` po kliknięciu "OK".
    - **Wywołanie:** `POST /api/topics/{topicId}/accept`
    - **Request Body:** `FlashcardAcceptDto` (`{ front: suggestion.front, back: suggestion.back }`)
    - **Response:** `FlashcardAcceptResponseDto`
    - **Obsługa:** Usunięcie zaakceptowanej sugestii ze stanu `suggestions`, aktualizacja `isLoading`, `error`.
- **Regeneracja ("Wygeneruj nową"):**
    - **Trigger:** `handleRegenerate(suggestionId)` po kliknięciu "Wygeneruj nową".
    - **Wywołanie:** `POST /api/topics/{topicId}/generate/alternative`
    - **Request Body:** `FlashcardGenerateAlternativeDto` (`{ source_text: sourceText, original_front: suggestion.originalFront, original_back: suggestion.originalBack }`)
    - **Response:** `FlashcardGenerateAlternativeResponseDto` (`FlashcardGeneratedDto`)
    - **Obsługa:** Aktualizacja danych konkretnej sugestii w stanie `suggestions`, aktualizacja `isLoading`, `error`.
- **Zapis Edytowanej ("Zapisz"):**
    - **Trigger:** `handleSaveEdit(suggestionId, front, back)` po kliknięciu "Zapisz" w trybie edycji.
    - **Wywołanie:** `POST /api/topics/{topicId}/accept-edited`
    - **Request Body:** `FlashcardAcceptEditedDto` (`{ front: editedFront, back: editedBack }`)
    - **Response:** `FlashcardAcceptEditedResponseDto`
    - **Obsługa:** Usunięcie zapisanej sugestii ze stanu `suggestions`, aktualizacja `isLoading`, `error`.

## 8. Interakcje użytkownika

- **Wprowadzanie tekstu:** Użytkownik wkleja lub wpisuje tekst w `SourceTextInput`. Stan `sourceText` jest aktualizowany.
- **Kliknięcie "Generuj":** Wywołuje `handleGenerate()`. Wyświetlany jest wskaźnik ładowania. Po odpowiedzi API, wyświetlane są sugestie lub błąd.
- **Kliknięcie "OK":** (Dostępne tylko gdy limity nie są przekroczone i nie w trybie edycji) Wywołuje `handleAccept()`. Sugestia znika z listy.
- **Kliknięcie "Wygeneruj nową":** Wywołuje `handleRegenerate()`. Wyświetlany jest wskaźnik ładowania (najlepiej na karcie). Treść sugestii jest aktualizowana.
- **Kliknięcie "Edytuj":** Wywołuje `handleEditToggle()`. Karta przechodzi w tryb edycji (`FlashcardEditForm`).
- **Edycja w formularzu:** Użytkownik modyfikuje tekst. Liczniki znaków są aktualizowane. Przycisk "Zapisz" jest aktywny/nieaktywny w zależności od limitów.
- **Kliknięcie "Zapisz":** (Dostępne tylko gdy limity są spełnione) Wywołuje `handleSaveEdit()`. Sugestia znika z listy.
- **Kliknięcie "Anuluj":** Wywołuje `handleCancelEdit()`. Karta wraca do trybu wyświetlania z oryginalną treścią sugestii.

## 9. Warunki i walidacja

- **Pusty tekst źródłowy:** Przycisk "Generuj" w `SourceTextInput` jest nieaktywny.
- **Przekroczenie limitu znaków (generowanie):** `FlashcardSuggestionCard` wyświetla ostrzeżenie (`exceeds_limit: true`). Przycisk "OK" jest nieaktywny. Użytkownik musi użyć "Edytuj" lub "Wygeneruj nową".
- **Przekroczenie limitu znaków (edycja):** `FlashcardEditForm` wyświetla liczniki znaków, wizualnie wskazując przekroczenie limitu (np. czerwony kolor licznika). Przycisk "Zapisz" jest nieaktywny.
- **Puste pola (edycja):** Przycisk "Zapisz" w `FlashcardEditForm` jest nieaktywny, jeśli pole awersu lub rewersu jest puste.

## 10. Obsługa błędów

- **Błędy sieciowe/API:** Hook `useAIGeneration` powinien przechwytywać błędy z wywołań `fetch`. Stan `error` powinien być ustawiany z komunikatem błędu. Komponent `GeneratedFlashcardsDisplay` powinien wyświetlać `ErrorMessage` na podstawie stanu `error`. Komunikaty powinny być przyjazne dla użytkownika (zgodnie z FR-015, US-018).
- **Brak sugestii:** Jeśli API zwróci pustą tablicę, `GeneratedFlashcardsDisplay` powinien wyświetlić odpowiedni komunikat (np. "Nie udało się wygenerować sugestii. Spróbuj użyć innego tekstu lub sformułowania.").
- **Błędy walidacji (400):** Przechwycić i wyświetlić odpowiedni komunikat błędu.

## 11. Kroki implementacji

1.  **Utworzenie pliku strony Astro:** Stworzyć plik `src/pages/topics/[id]/generate.astro`.
2.  **Implementacja komponentu strony `AIGenerationView`:** Stworzyć komponent React (`src/components/views/AIGenerationView.tsx`), który będzie renderowany w pliku Astro z dyrektywą `client:load`. Komponent powinien pobierać `topicId` z propsów przekazanych przez Astro.
3.  **Implementacja hooka `useAIGeneration`:** Stworzyć hook (`src/hooks/useAIGeneration.ts`) zarządzający stanem (`sourceText`, `suggestions`, `isLoading`, `error`) i logiką API (handlery).
4.  **Implementacja komponentu `SourceTextInput`:** Stworzyć komponent (`src/components/ai/SourceTextInput.tsx`) z `Textarea` i `Button` (Shadcn/ui). Podłączyć go do stanu i handlerów z hooka.
5.  **Implementacja komponentu `GeneratedFlashcardsDisplay`:** Stworzyć komponent (`src/components/ai/GeneratedFlashcardsDisplay.tsx`) do wyświetlania listy sugestii, stanu ładowania i błędów.
6.  **Implementacja komponentu `FlashcardSuggestionCard`:** Stworzyć komponent (`src/components/ai/FlashcardSuggestionCard.tsx`) używając `Card` z Shadcn/ui. Zaimplementować wyświetlanie awersu/rewersu, ostrzeżenia o limicie i przycisków akcji. Podłączyć handlery z hooka.
7.  **Implementacja komponentu `FlashcardEditForm`:** Stworzyć komponent (`src/components/ai/FlashcardEditForm.tsx`) z polami `Textarea`, licznikami znaków i przyciskami "Zapisz"/"Anuluj". Zaimplementować logikę walidacji limitów znaków i stanu przycisku "Zapisz".
8.  **Integracja API:** Zaimplementować funkcje wywołujące API wewnątrz hooka `useAIGeneration` używając `fetch` i typów DTO z `src/types.ts`.
9.  **Obsługa stanów:** Upewnić się, że stany `isLoading` i `error` są poprawnie zarządzane i odzwierciedlane w UI (wskaźniki ładowania, komunikaty błędów).
10. **Styling i responsywność:** Dopracować wygląd używając Tailwind CSS i komponentów Shadcn/ui. Upewnić się, że widok jest responsywny.
11. **Testowanie:** Przetestować wszystkie ścieżki interakcji użytkownika, walidację i obsługę błędów.
```

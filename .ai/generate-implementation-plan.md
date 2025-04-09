# API Endpoint Implementation Plan: AI Generation API

## 1. Przegląd punktu końcowego
Endpointy API służą do generowania fiszek przy użyciu AI. Umożliwiają:
- Generowanie fiszek z zadanego tekstu.
- Generowanie alternatywnych propozycji dla wybranej fiszki.
- Akceptację wygenerowanej fiszki (oryginalnej lub po edycji).

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL:
  - `/topics/:topic_id/generate`
  - `/topics/:topic_id/generate/alternative`
  - `/topics/:topic_id/accept`
  - `/topics/:topic_id/accept-edited`
- Parametry URL:
  - Wymagany: `topic_id`
- Request Body:
  - Dla `/generate`: `{ "source_text": "string" }`
  - Dla `/generate/alternative`: `{ "source_text": "string", "original_front": "string", "original_back": "string" }`
  - Dla `/accept` i `/accept-edited`: `{ "front": "string", "back": "string" }`

## 3. Wykorzystywane typy
- DTO z pliku `types.ts`:
  - FlashcardGenerateDto
  - FlashcardGeneratedResponseDto
  - FlashcardGenerateAlternativeDto
  - FlashcardGenerateAlternativeResponseDto
  - FlashcardAcceptDto
  - FlashcardAcceptResponseDto
  - FlashcardAcceptEditedDto
  - FlashcardAcceptEditedResponseDto

## 4. Przepływ danych
1. Klient wysyła żądanie POST z odpowiednimi danymi wejściowymi.
2. Warstwa walidacji (np. z użyciem Zod) sprawdza poprawność danych.
3. Kontroler pobiera `topic_id` z URL, przekazuje dane do warstwy serwisu.
4. Serwis:
   - Interaguje z bazą danych (tabele `topics` i `flashcards`)
   - Wywołuje moduł AI, który generuje treści
   - Buduje i zwraca odpowiednią odpowiedź DTO
5. Kontroler zwraca odpowiedź z kodem 201 lub 200, zależnie od operacji.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie i autoryzacja: Zapewnienie, że użytkownik ma dostęp do wskazanego tematu.
- Walidacja wejścia: Użycie Zod w celu zapobiegania wstrzykiwaniu danych lub nienumerycznym błędom.
- Ograniczenia dotyczące pól tekstowych – zgodnie z stałymi `FLASHCARD_LIMITS`.

## 6. Obsługa błędów
- 400: Nieprawidłowe dane wejściowe (np. błąd walidacji)
- 401: Brak autoryzacji (użytkownik nie posiada dostępu do tematu)
- 404: Nieznaleziony temat lub fiszka
- 500: Błąd operacji na bazie lub wywołania AI
- Rejestrowanie błędów – logowanie szczegółów błędów serwera do systemu logowania

## 7. Rozważania dotyczące wydajności
- Wykorzystanie cache tam, gdzie to stosowne.
- Asynchroniczna komunikacja z modułem AI.
- Użycie indeksów w bazie danych dla szybkiego dostępu do tematów i fiszek.

## 8. Etapy wdrożenia
1. Utworzenie lub rozszerzenie kontrolerów w katalogu API (np. `/src/pages/api/topics/[topic_id]/generate.ts`) z implementacją logiki wejścia, autoryzacji i walidacji.
2. Wyodrębnienie logiki generowania fiszek do nowego serwisu (np. `/src/lib/services/flashcardService.ts`), w tym wywołanie modułu AI, przetwarzanie wyników i aktualizacja bazy danych.
3. Implementacja walidacji i obsługi błędów:
   - Zdefiniowanie schematów Zod dla każdego endpointu.
   - Rejestrowanie błędów do logów systemowych oraz zwracanie odpowiednich kodów statusu.

---

Plan wdrożenia do tej pory obejmuje 3 główne kroki:
- Krok 1: Utworzenie kontrolerów API ze sprawdzaniem uprawnień i walidacją wejścia.
- Krok 2: Utworzenie serwisu do obsługi AI oraz interakcji z bazą danych.
- Krok 3: Implementacja walidacji wejścia i globalnej obsługi błędów.

Proszę o feedback przed kontynuacją kolejnych działań.

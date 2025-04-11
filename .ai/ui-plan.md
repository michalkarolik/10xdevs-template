# Architektura UI dla AI Flashcard Generator

## 1. Przegląd struktury UI
- Interfejs opiera się na wyraźnie wydzielonych widokach zapewniających intuicyjną nawigację.
- Globalny pasek nawigacyjny umożliwia szybki dostęp do najważniejszych sekcji (dashboard, tematy, sesje nauki, panel użytkownika).
- Użycie responsywnego designu i komponentów zgodnych z WCAG AA gwarantuje dostępność i bezpieczeństwo.

## 2. Lista widoków
- **Widok logowania** `[Do zaimplementowania]`
  Ścieżka: `/login`  
  Cel: Umożliwienie autoryzacji użytkownika.  
  Kluczowe informacje: Formularz logowania, komunikaty o błędach autoryzacyjnych.  
  Kluczowe komponenty: Formularz, przycisk logowania.  
  UX/dostępność: Prosty formularz, etykiety dostępne dla czytników ekranu.

- **Dashboard (Pulpit użytkownika)** `[Do zaimplementowania]`
  Ścieżka: `/dashboard`  
  Cel: Przegląd tematyki, powiadomienia i statystyki.  
  Kluczowe informacje: Lista tematów, skróty do akcji (dodaj temat, rozpocznij naukę).  
  Kluczowe komponenty: Karty tematyczne, wykresy/statystyki, globalny pasek nawigacyjny.  
  UX/dostępność: Przejrzysty układ, responsywność, kontrastowe kolory.

- **Widok zarządzania tematami** `[Częściowo zaimplementowany]`
  Ścieżka: `/topics`  
  Cel: Dodawanie, edycja i usuwanie tematów.  
  Kluczowe informacje: Lista tematów, przycisk dodawania nowego tematu.  
  Kluczowe komponenty: Lista, formularz dodawania/edycji, przyciski akcji.  
  UX/dostępność: Jasno oznakowane akcje, potwierdzenia usunięcia.

- **Widok szczegółowy tematu i fiszek** `[Do zaimplementowania]`
  Ścieżka: `/topics/:id`  
  Cel: Przegląd i zarządzanie fiszkami w obrębie wybranego tematu.  
  Kluczowe informacje: Lista fiszek, przyciski edycji/usunięcia, opcje dodania nowej fiszki.  
  Kluczowe komponenty: Lista, modale edycji/usunięcia, przycisk do generowania AI.  
  UX/dostępność: Łatwa nawigacja między operacjami, intuicyjne potwierdzenia.

- **Widok generowania fiszek przez AI** `[Zaimplementowany]`
  Ścieżka: `/topics/:id/generate`  
  Cel: Umożliwienie wygenerowania fiszek na podstawie podanego tekstu.  
  Kluczowe informacje: Pole do wklejenia tekstu, przycisk "Generuj", prezentacja propozycji AI.  
  Kluczowe komponenty: Formularz, przyciski "OK", "Wygeneruj nową", "Edytuj".  
  UX/dostępność: Informowanie o przekraczaniu limitów znaków, loader dla oczekiwania na wynik.

- **Panel użytkownika (zarządzanie kontem)** `[Do zaimplementowania]`
  Ścieżka: `/profile`  
  Cel: Zarządzanie danymi konta i opcja usunięcia konta.  
  Kluczowe informacje: Dane użytkownika, opcje zmiany hasła, usunięcia konta.  
  Kluczowe komponenty: Formularze, przyciski akcji, komunikaty potwierdzające.  
  UX/dostępność: Jasne instrukcje, bezpieczne operacje na danych konta.

- **Widok sesji nauki** `[Do zaimplementowania]`
  Ścieżka: `/learning/session`  
  Cel: Przeprowadzenie sesji nauki z fiszkami i ich oceną.  
  Kluczowe informacje: Wyświetlany awers fiszki, przycisk odsłonięcia rewersu, opcje oceny.  
  Kluczowe komponenty: Karty fiszek, przyciski oceny, licznik postępu.  
  UX/dostępność: Minimalistyczny interfejs, łatwość nawigacji, wyraźny podział między pytaniami a odpowiedziami.

## 3. Mapa podróży użytkownika
- Użytkownik wchodzi na stronę i trafia do widoku logowania.
- Po pomyślnym logowaniu użytkownik zostaje przekierowany na dashboard, gdzie widzi listę tematów.
- Użytkownik wybiera istniejący temat lub tworzy nowy.
- W widoku szczegółowym tematu użytkownik może:
  - Dodać nową fiszkę ręcznie, korzystając z formularza.
  - Wygenerować fiszki AI – wprowadza tekst, a następnie przegląda i ocenia propozycje.
- W przypadku wykrycia przekroczenia limitów znaków przy generowaniu AI, użytkownik otrzymuje komunikat i musi edytować treść.
- Po zaakceptowaniu fiszki, użytkownik wraca do listy fiszek.
- Użytkownik rozpoczyna sesję nauki, gdzie kolejno przegląda fiszki, odsłania rewersy i ocenia swoją wiedzę.
- W razie błędów system wyświetla czytelne komunikaty, umożliwiając powrót do poprzedniego widoku lub próbę ponownego działania.

## 4. Układ i struktura nawigacji
- Globalny pasek nawigacyjny widoczny na wszystkich stronach z dostępem do: Dashboard, Tematy, Sesje nauki i Panel Użytkownika.
- Menu kontekstowe wewnątrz widoków (np. przy edycji/usuwaniu fiszek) umożliwia szybkie wykonanie akcji.
- Nawigacja opiera się na responsywnym designie, z rozwijanymi menu na urządzeniach mobilnych.
- Jasne ścieżki nawigacyjne i przyciski umożliwiają intuicyjne poruszanie się pomiędzy widokami.

## 5. Kluczowe komponenty
- Formularze: logowania, rejestracji, dodawania/edycji tematów i fiszek.
- Modale: potwierdzenia usunięcia, edycji fiszek.
- Komponent listy: wyświetlanie tematów i fiszek z akcjami.
- Globalny pasek nawigacyjny: linki do głównych widoków.
- Komponenty przycisków: do akcji generowania, edycji, oceny oraz zarządzania sesją nauki.
- Loader oraz komunikaty błędów: informowanie użytkownika o stanie operacji.

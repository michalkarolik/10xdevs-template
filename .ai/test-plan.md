# Plan Testów dla Projektu AI Flashcards

## 1. Wprowadzenie

### 1.1. Opis Projektu
Projekt AI Flashcards to aplikacja do zarządzania nauką poprzez fiszki, umożliwiająca użytkownikowi ręczne dodawanie fiszek oraz generowanie ich przy użyciu AI. Użytkownik może rozpocząć sesję nauki, w której fiszki są prezentowane według priorytetów (pierwsze te oznaczone jako "Again", następnie "Hard"). System korzysta m.in. z technologii: Astro 5, TypeScript 5, React 19, Tailwind 4, Supabase, Vite i OpenAI.

### 1.2. Cele Planu Testów
- Zweryfikowanie, że kluczowe funkcjonalności (logowanie, generowanie fiszek, sesje nauki) działają zgodnie z wymaganiami.
- Zapewnienie bezpieczeństwa, wydajności i użyteczności aplikacji.
- Identyfikacja oraz zgłoszenie błędów na wczesnym etapie.
- Zapewnienie zgodności z dokumentacją (@auth-detailed.md, @db-plan.md, @prd.md, @tech-stack.md, @ui.plan.md).

### 1.3. Zakres Testów
Testy obejmą:
- Testy jednostkowe (logika funkcji, komponenty React, helpery)
- Testy integracyjne (interakcje między modułami, API, middleware)
- Testy systemowe (całościowe zachowanie aplikacji dla zalogowanych i niezalogowanych użytkowników)
- Testy akceptacyjne (UAT) – weryfikacja zgodności z wymaganiami użytkownika

Nie będą testowane:
- Elementy nieobjęte MVP (np. zaawansowane algorytmy powtórek)
- Interfejsy przeznaczone do użytku wyłącznie w przyszłych wersjach

## 2. Strategia Testowania

### 2.1. Poziomy Testów
- **Testy jednostkowe:** Skoncentrowane na logice funkcji, komponentach oraz pomocniczych metodach. Użycie narzędzi: Vitest, React Testing Library, Zod do walidacji.
- **Testy integracyjne:** Sprawdzenie współdziałania komponentów React z Astro, integracja z Supabase oraz middleware. Testy REST API z wykorzystaniem narzędzi takich jak MSW.
- **Testy systemowe/E2E:** Weryfikacja pełnego przepływu aplikacji (logowanie, generowanie fiszek, sesje nauki) z wykorzystaniem Playwright jako narzędzia do automatyzacji testów na różnych przeglądarkach.
- **Testy akceptacyjne (UAT):** Przeprowadzenie testów akceptacyjnych z udziałem przedstawicieli biznesu, weryfikacja realizacji kryteriów akceptacji.

### 2.2. Typy Testów
- **Funkcjonalne:** Testowanie procesów rejestracji, logowania, tworzenia i generowania fiszek, uruchamiania sesji nauki oraz wylogowywania.
- **Niefunkcjonalne:**
    - **Wydajnościowe:** Testy obciążeniowe API i przepustowości serwera Supabase.
    - **Bezpieczeństwa:** Weryfikacja uprawnień, ochrony danych użytkownika, testy penetracyjne (np. zabezpieczenia anty-CSRF).
    - **Użyteczności:** Ocena interfejsu pod kątem ergonomii i dostępności (wcześniejsze przygotowanie testów manualnych przy użyciu narzędzi jak Axe).
    - **Kompatybilności:** Testy responsywności i przeglądarek (głównie dla Astro, React, Tailwind).

### 2.3. Wpływ Wybranego Technologicznego Stacka
Stack oparty na Astro, TypeScript, React, Tailwind i Supabase wpływa na:
- Użycie biblioteki Testing Library dla testów komponentów React.
- Testowanie API za pomocą narzędzi typu MSW oraz integracyjnych testów Astro.
- Walidację danych z użyciem Zod.
- Automatyzację testów przy wykorzystaniu narzędzi CI/CD, np. Github Actions.

## 3. Zakres Testów - Moduły i Funkcjonalności
- **Logowanie/Rejestracja:** Walidacja formularzy, komunikaty błędów, przekierowania.
- **Obsługa sesji nauki:** Kolejkowanie fiszek zgodnie z priorytetem ("Again", "Hard"), płynność przejść między fiszkami.
- **Generowanie fiszek przez AI:** Testowanie walidacji limitów znaków, przejrzystości komunikatów błędów, poprawności zapisu wygenerowanych danych.
- **Zarządzanie użytkownikami:** Dostęp do treści jedynie dla zalogowanych użytkowników, weryfikacja wylogowywania oraz usunięcia konta.
- **Interfejs UI:** Responsywność, dostępność (ARIA, kontrast, role).

## 4. Środowiska Testowe
- **Środowisko deweloperskie:** Lokalny system z danymi przykładowymi.
- **Środowisko testowe:** System odzwierciedlający produkcję z izolowaną bazą danych (Supabase) i konfiguracją CI/CD.
- **Środowisko staging:** Pełna symulacja produkcji do testów akceptacyjnych.
- **Wymagania dotyczące danych:** Zestawy danych testowych pokrywające różne scenariusze (poprawne dane, błędne, skrajne przypadki).

## 5. Role i Odpowiedzialności
- **QA Engineer / Lider Zespołu:** Odpowiedzialność za opracowanie strategii testów, przygotowanie i przeprowadzenie testów automatycznych oraz manualnych.
- **Deweloperzy:** Tworzenie testów jednostkowych, integracyjnych i wsparcie przy testach API.
- **Testerzy Manualni:** Przeprowadzanie testów akceptacyjnych, testowanie użyteczności oraz testy regresji.
- **DevOps:** Konfiguracja środowisk testowych oraz integracja z pipeline CI/CD.

## 6. Narzędzia Testowe
- **Testy jednostkowe i integracyjne:** Vitest, React Testing Library, Testing Library Astro.
- **Testy API:** MSW, Supertest (dla endpointów Astro).
- **Testy E2E:** Playwright do testowania interfejsu użytkownika na różnych przeglądarkach (Chrome, Firefox, Safari).
- **Testy wydajnościowe:** Artillery, k6.
- **Testy bezpieczeństwa:** OWASP ZAP, Snyk.
- **CI/CD:** Github Actions do automatyzacji testów.
- **Zarządzanie defektami:** Jira, GitHub Issues.
- **Raportowanie:** Allure Reports, raporty generowane przez narzędzia CI.

## 7. Kryteria Wejścia i Wyjścia
- **Wejścia:** Dostępność środowisk testowych, kompletna konfiguracja CI/CD, dostęp do dokumentacji (PRD, specyfikacje, diagramy bazy).
- **Wyjścia:** Stabilne, akceptowane wyniki testów, raporty o pokryciu testami, lista zatwierdzonych defektów i raportów incydentowych.

## 8. Zarządzanie Defektami
- Zgłaszanie: Defekty zgłaszane za pomocą systemu Jira lub GitHub Issues.
- Priorytetyzacja: Defekty klasyfikowane według wpływu na użytkownika (krytyczne, ważne, drobne).
- Śledzenie: Każdy defekt powinien być opisany, przypisany oraz proces naprawy śledzony w narzędziu.
- Weryfikacja: Retest po naprawie i testy regresji przed wdrożeniem.

## 9. Ryzyka i Plany Awaryjne
- **Ryzyka:** Braki w środowiskach testowych, niska jakość danych testowych, opóźnienia wynikające z integracji z Supabase lub API AI.
- **Dodatkowe ryzyka:** Potencjalne problemy kompatybilności z Vitest dla niektórych testów, konieczność przygotowania odpowiednich konfiguracji.
- **Plany Awaryjne:** Utworzenie kopii zapasowych danych, użycie symulatorów dla usług zewnętrznych (np. API AI), harmonogram ciągłych testów regresyjnych przy każdej aktualizacji kodu.

## 10. Metryki i Raportowanie
- **Wskaźniki:** Pokrycie kodu testami, liczba defektów na iterację, czas reakcji na zgłoszenia defektów.
- **Raportowanie:** Codzienne/bieżące raporty statusu, statystyki z pipeline CI/CD, podsumowanie testów akceptacyjnych.
- **Feedback:** Regularne spotkania zespołu w celu omówienia wyników testów i optymalizacji planu testowego.

## 11. Automatyzacja i Integracja Ciągła

### 11.1. Strategia Automatyzacji E2E z Playwright
- **Cross-browser testing:** Automatyczne testy na Chrome, Firefox i Safari dla kluczowych scenariuszy użytkownika.
- **Visual testing:** Porównywanie zrzutów ekranu dla wykrywania regresji wizualnych.
- **Nagrywanie sesji testowych:** Automatyczne generowanie nagrań wideo i trace dla nieudanych testów.
- **Izolacja testów:** Wykorzystanie osobnych kontekstów przeglądarki dla niezależnego wykonania testów.

### 11.2. Scenariusze Testów E2E
- **Rejestracja i logowanie:** Pełen przepływ rejestracji, weryfikacji i logowania użytkownika.
- **Tworzenie i zarządzanie fiszkami:** Tworzenie, edycja, usuwanie fiszek ręcznych.
- **Generowanie fiszek przez AI:** Testowanie interfejsu i interakcji z API AI.
- **Sesje nauki:** Weryfikacja przepływu sesji nauki oraz algorytmu priorytetyzacji.
- **Responsywność:** Testowanie aplikacji na różnych rozmiarach ekranu.

### 11.3. Integracja Playwright z CI/CD
- **Paralelizacja testów:** Równoległe uruchamianie testów na wielu przeglądarkach w pipeline CI.
- **Artefakty testowe:** Automatyczne zbieranie zrzutów ekranu, nagrań wideo i trace dla nieudanych testów.
- **Dashboardy raportowe:** Generowanie przejrzystych raportów z wynikami testów E2E.

## 12. Korzyści wyboru Vitest zamiast Jest

### 12.1. Zalety Vitest dla projektu AI Flashcards
- **Natywna integracja z Vite:** Znacząco szybsze uruchamianie testów dzięki wykorzystaniu natywnego HMR Vite.
- **Kompatybilność API z Jest:** Minimalna krzywa uczenia dla zespołu znającego Jest.
- **Wsparcie dla TypeScript i ESM:** Lepsza obsługa modułów ES i TypeScript out-of-the-box.
- **Mniejsza konfiguracja:** Automatyczne rozpoznawanie konfiguracji Vite i mniejsza potrzeba dodatkowej konfiguracji.

### 12.2. Strategia migracji
- Początkowe ustawienie testów w Vitest z domyślną konfiguracją
- Wykorzystanie trybów "watch" dla szybszego feedbacku podczas rozwoju
- Konfiguracja integracji CI/CD z Vitest

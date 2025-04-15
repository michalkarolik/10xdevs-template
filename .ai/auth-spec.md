# Specyfikacja Techniczna Modułu Autentykacji

## 1. Przegląd

Niniejsza specyfikacja opisuje architekturę modułu autentykacji dla aplikacji "AI Flashcard Generator". Moduł ten obsługuje rejestrację użytkowników, logowanie, wylogowywanie oraz usuwanie konta zgodnie z wymaganiami US-001, US-002 i US-003 z dokumentu PRD. 

Implementacja wykorzystuje Supabase jako dostawcę autentykacji i będzie zintegrowana z frameworkiem Astro oraz komponentami React dla części interaktywnych.

## 2. Architektura Interfejsu Użytkownika

### 2.1. Nowe Strony

#### 2.1.1. Strona Logowania (`/login`)
- **Typ**: Strona Astro z komponentem interaktywnym React
- **Elementy UI**:
  - Nagłówek "Logowanie"
  - Formularz logowania (komponent React)
  - Link do strony rejestracji
  - Komunikaty błędów

#### 2.1.2. Strona Rejestracji (`/register`)
- **Typ**: Strona Astro z komponentem interaktywnym React
- **Elementy UI**:
  - Nagłówek "Rejestracja"
  - Formularz rejestracji (komponent React)
  - Link do strony logowania
  - Komunikaty błędów i walidacji

#### 2.1.3. Strona Ustawienia Konta (`/settings`)
- **Typ**: Strona Astro z komponentami interaktywnymi React
- **Elementy UI**:
  - Sekcja usunięcia konta z przyciskiem usuwania i potwierdzenia
  - Komunikaty błędów i potwierdzenia
- **Zabezpieczenia**: Dostępna tylko dla zalogowanych użytkowników

### 2.2. Komponenty React

#### 2.2.1. `LoginForm`
- **Funkcje**:
  - Renderowanie formularza logowania z polami na email i hasło
  - Walidacja danych wejściowych
  - Obsługa procesu logowania poprzez Supabase Auth
  - Wyświetlanie komunikatów błędów
  - Przekierowanie do panelu głównego po udanym logowaniu

#### 2.2.2. `RegisterForm`
- **Funkcje**:
  - Renderowanie formularza rejestracji z polami na email, hasło i potwierdzenie hasła
  - Walidacja danych wejściowych (email, hasło, potwierdzenie hasła)
  - Obsługa procesu rejestracji poprzez Supabase Auth
  - Wyświetlanie komunikatów błędów
  - Przekierowanie do panelu głównego po udanej rejestracji

#### 2.2.3. `DeleteAccountConfirm`
- **Funkcje**:
  - Renderowanie przycisku usunięcia konta
  - Pokazywanie okna dialogowego potwierdzenia
  - Obsługa procesu usuwania konta
  - Wyświetlanie komunikatów potwierdzenia lub błędów

#### 2.2.4. `UserAuthStatus`
- **Funkcje**:
  - Wyświetlanie informacji o zalogowanym użytkowniku (email)
  - Przycisk wylogowania
  - Link do ustawień konta

### 2.3. Modyfikacje Istniejących Elementów UI

#### 2.3.1. Layout Główny
- Dodanie komponentu `UserAuthStatus` w nagłówku strony
- Dynamiczne wyświetlanie opcji menu zależnie od stanu autentykacji

#### 2.3.2. Strona Główna
- Dostosowanie treści w zależności od stanu autentykacji
- Dodanie przycisku przekierowującego do logowania/rejestracji dla niezalogowanych użytkowników
- Wyświetlanie panelu z tematami dla zalogowanych użytkowników

### 2.4. Rozdzielenie Odpowiedzialności

#### 2.4.1. Komponenty React (Client-side)
- **Odpowiedzialność**:
  - Interaktywne formularze
  - Walidacja danych po stronie klienta
  - Komunikacja z API Supabase
  - Stan formularzy i obsługa błędów
  - Przekierowania po udanych akcjach

#### 2.4.2. Strony Astro (Server-side)
- **Odpowiedzialność**:
  - Renderowanie struktury strony
  - Sprawdzanie stanu autentykacji użytkownika
  - Renderowanie odpowiednich komponentów React
  - Zabezpieczenie stron wymagających autentykacji
  - SEO i metadane

### 2.5. Walidacja i Komunikaty Błędów

#### 2.5.1. Walidacja Formularzy
- **Email**:
  - Niepuste pole
  - Prawidłowy format adresu email
  - Sprawdzenie unikalności emaila
  
- **Hasło**:
  - Niepuste pole
  - Minimalnie 8 znaków
  - Co najmniej jedna wielka litera
  - Co najmniej jedna cyfra
  
- **Potwierdzenie Hasła**:
  - Identyczne z polem hasła

#### 2.5.2. Komunikaty Błędów
- **Błędy Walidacji**:
  - Wyświetlane pod każdym polem formularza
  - Aktualizowane w czasie rzeczywistym podczas wpisywania
  
- **Błędy Autentykacji**:
  - Nieprawidłowe dane logowania
  - Zajęty email
  - Problemy z połączeniem z serwerem

### 2.6. Scenariusze Użytkownika

#### 2.6.1. Rejestracja Nowego Użytkownika
1. Użytkownik wchodzi na stronę `/register`
2. Wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła)
3. System waliduje dane, w tym unikalność emaila
4. Po pomyślnej walidacji, system tworzy konto użytkownika
5. Użytkownik jest automatycznie logowany
6. Następuje przekierowanie do panelu głównego

#### 2.6.2. Logowanie Istniejącego Użytkownika
1. Użytkownik wchodzi na stronę `/login`
2. Wprowadza email i hasło
3. System weryfikuje dane uwierzytelniające
4. Po pomyślnej weryfikacji, użytkownik jest zalogowany
5. Następuje przekierowanie do panelu głównego

#### 2.6.3. Wylogowanie Użytkownika
1. Zalogowany użytkownik klika przycisk "Wyloguj" w komponencie `UserAuthStatus`
2. System kończy sesję użytkownika
3. Użytkownik jest przekierowywany do strony głównej

#### 2.6.4. Usunięcie Konta
1. Zalogowany użytkownik przechodzi do `/settings`
2. Klika przycisk "Usuń konto"
3. System wyświetla okno potwierdzenia
4. Po potwierdzeniu, system usuwa konto użytkownika i wszystkie powiązane dane (tematy, fiszki)
5. Użytkownik jest wylogowywany i przekierowywany do strony głównej

## 3. Logika Backendowa

### 3.1. Integracja z Supabase

#### 3.1.1. Usługi Supabase
- **Auth Service**: Obsługa autentykacji użytkowników
- **Database Service**: Przechowywanie danych użytkowników i powiązanych informacji

#### 3.1.2. Klient Supabase
- Inicjalizacja klienta Supabase z odpowiednimi kluczami API
- Eksport instancji klienta do wykorzystania w komponentach React i stronach Astro

### 3.2. API Endpoints (Supabase Auth)

#### 3.2.1. Rejestracja
- **Endpoint**: `supabase.auth.signUp()`
- **Parametry**: 
  - `email`: adres email użytkownika
  - `password`: hasło użytkownika
- **Zwraca**: 
  - Sukces: Dane użytkownika i token sesji
  - Błąd: Kod błędu i komunikat

#### 3.2.2. Logowanie
- **Endpoint**: `supabase.auth.signInWithPassword()`
- **Parametry**: 
  - `email`: adres email użytkownika
  - `password`: hasło użytkownika
- **Zwraca**: 
  - Sukces: Dane użytkownika i token sesji
  - Błąd: Kod błędu i komunikat

#### 3.2.3. Wylogowanie
- **Endpoint**: `supabase.auth.signOut()`
- **Zwraca**: 
  - Sukces: Potwierdzenie wylogowania
  - Błąd: Kod błędu i komunikat

#### 3.2.4. Usunięcie Konta
- **Custom Endpoint**: `supabase.rpc('delete_user_complete')`
- **Wymaga**: Funkcja RPC po stronie Supabase do usunięcia konta i wszystkich powiązanych danych
- **Działanie**: Funkcja usuwa wszystkie tematy, fiszki i inne dane użytkownika, a następnie samo konto

### 3.3. Modele Danych

#### 3.3.1. Model Użytkownika (Supabase Auth)
- **Tabela**: `auth.users` (wbudowana w Supabase)
- **Pola**:
  - `id`: UUID, klucz główny
  - `email`: adres email użytkownika
  - `created_at`: data utworzenia konta
  - `updated_at`: data aktualizacji danych

### 3.4. Walidacja Danych Wejściowych

#### 3.4.1. Walidacja Po Stronie Klienta
- Implementacja w komponentach React za pomocą biblioteki walidacyjnej (np. Zod, Yup)
- Walidacja w czasie rzeczywistym podczas wprowadzania danych

#### 3.4.2. Walidacja Po Stronie Serwera
- Walidacja przed wywołaniem API Supabase
- Dodatkowe zabezpieczenia w postaci restrykcji Supabase RLS (Row Level Security)

### 3.5. Obsługa Wyjątków

#### 3.5.1. Błędy Autentykacji
- Mapowanie kodów błędów Supabase na przyjazne dla użytkownika komunikaty
- Lokalizacja komunikatów błędów (język polski)
- Logowanie błędów do celów diagnostycznych

#### 3.5.2. Błędy API
- Obsługa problemów z połączeniem
- Obsługa nieoczekiwanych odpowiedzi z API
- Fallback w przypadku awarii usług Supabase

### 3.6. Middleware Astro

#### 3.6.1. Middleware Autentykacji
- Sprawdzanie stanu autentykacji użytkownika przed renderowaniem stron zabezpieczonych
- Przekierowywanie niezalogowanych użytkowników do strony logowania
- Przekierowywanie zalogowanych użytkowników z publicznych stron autentykacji (np. logowanie, rejestracja)

## 4. System Autentykacji

### 4.1. Integracja Supabase Auth z Astro

#### 4.1.1. Konfiguracja Supabase Auth
- Konfiguracja dostawcy autentykacji (email/hasło)

#### 4.1.2. Zarządzanie Sesją Użytkownika
- Przechowywanie tokenu sesji w localStorage
- Odświeżanie tokenu sesji przy wygaśnięciu
- Sprawdzanie sesji przy każdym ładowaniu strony

### 4.2. Przepływ Autentykacji

#### 4.2.1. Rejestracja
1. Zebranie danych użytkownika (email, hasło, potwierdzenie hasła)
2. Walidacja danych wejściowych
3. Wywołanie `supabase.auth.signUp()`
4. Ustawienie sesji użytkownika
5. Przekierowanie do panelu głównego

#### 4.2.2. Logowanie
1. Zebranie danych logowania (email, hasło)
2. Walidacja danych wejściowych
3. Wywołanie `supabase.auth.signInWithPassword()`
4. Ustawienie sesji użytkownika
5. Przekierowanie do panelu głównego

#### 4.2.3. Wylogowanie
1. Wywołanie `supabase.auth.signOut()`
2. Usunięcie sesji użytkownika
3. Przekierowanie do strony głównej

#### 4.2.4. Usunięcie Konta
1. Potwierdzenie decyzji użytkownika
2. Wywołanie niestandardowej funkcji RPC Supabase do usunięcia konta i wszystkich powiązanych danych
3. Kaskadowe usunięcie wszystkich tematów i fiszek użytkownika
4. Wywołanie `supabase.auth.signOut()`
5. Przekierowanie do strony głównej

### 4.3. Bezpieczeństwo

#### 4.3.1. Polityka Haseł
- Minimum 8 znaków
- Kombinacja małych i wielkich liter, cyfr

#### 4.3.2. Zabezpieczenia API
- Wykorzystanie Row Level Security (RLS) Supabase
- Odpowiednie uprawnienia dla tabel i funkcji
- Autoryzacja zapytań za pomocą tokenu JWT

#### 4.3.3. Ochrona Przed Atakami
- Ograniczenie liczby prób logowania
- Opóźnienia między próbami logowania (rate limiting)
- Zabezpieczenia przed atakami CSRF

## 5. Wnioski i Zalecenia Implementacyjne

1. **Prostota i Przejrzystość**:
   - Wydzielenie logiki autentykacji do dedykowanych hooków React i helpers dla stron Astro
   - Tworzenie abstrakcji dla operacji Supabase Auth dla łatwiejszego testowania i rozbudowy

2. **Progressive Enhancement**:
   - Formularze powinny działać nawet bez JavaScript
   - Obsługa podstawowych funkcji przez Astro (SSR)
   - Wzbogacenie doświadczenia przez React (walidacja w czasie rzeczywistym, komunikaty)

3. **Bezpieczeństwo**:
   - Implementacja RLS dla wszystkich tabel Supabase
   - Konfiguracja CORS dla API Supabase
   - Przechowywanie kluczy API w zmiennych środowiskowych

4. **UX Autentykacji**:
   - Jasne komunikaty błędów
   - Wizualna informacja o stanie procesu logowania/rejestracji
   - Informowanie użytkownika o ważnych akcjach (np. usunięcie konta)

5. **Usuwanie Konta**:
   - Implementacja funkcji RPC w Supabase, która kasuje wszystkie dane użytkownika
   - Kaskadowe usuwanie wszystkich rekordów powiązanych z użytkownikiem (tematy, fiszki, sesje nauki)
   - Upewnienie się, że proces jest nieodwracalny i kompletny

## 6. Zadania Implementacyjne

1. Konfiguracja projektu Supabase i inicjalizacja Auth
2. Utworzenie niezbędnych tabel i polityk RLS
3. Implementacja middleware Astro dla ochrony stron
4. Utworzenie stron i komponentów React dla autentykacji
5. Implementacja hooków i helpers do łatwego zarządzania autentykacją
6. Integracja autentykacji z istniejącymi stronami aplikacji
7. Implementacja funkcji RPC do usuwania konta użytkownika i wszystkich powiązanych danych
8. Testy i debugging wszystkich scenariuszy
9. Wdrożenie zabezpieczeń i monitoringu
10. Dokumentacja końcowa i instrukcje dla developerów


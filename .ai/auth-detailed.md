# Diagram Przepływu Autentykacji

<authentication_analysis>
## Analiza Przepływów Autentykacji

### 1. Przepływy Autentykacji
Na podstawie dokumentów referencyjnych zidentyfikowałem następujące przepływy autentykacji:
- Rejestracja nowego użytkownika
- Logowanie istniejącego użytkownika
- Wylogowanie użytkownika
- Usunięcie konta użytkownika
- Weryfikacja sesji użytkownika
- Odświeżanie tokenu sesji

### 2. Główni Aktorzy i ich Interakcje
- **Przeglądarka (Browser)**: Interfejs użytkownika, gdzie użytkownik wprowadza dane logowania, rejestracji i wykonuje akcje
- **Middleware Astro**: Warstwa pośrednia sprawdzająca stan autentykacji przed renderowaniem stron
- **Astro API**: Warstwa serwerowa odpowiedzialna za renderowanie stron i komunikację z Supabase
- **Supabase Auth**: Usługa autentykacji przechowująca dane użytkowników i zarządzająca tokenami sesji

Interakcje zachodzą w następujący sposób:
- Przeglądarka komunikuje się z Middleware podczas żądania dostępu do stron
- Middleware komunikuje się z Supabase Auth w celu weryfikacji tokenów
- Astro API renderuje odpowiednie strony na podstawie decyzji Middleware
- Supabase Auth zarządza danymi użytkowników i tokenami sesji

### 3. Procesy Weryfikacji i Odświeżania Tokenów
- **Weryfikacja Tokenu**: Przy każdym żądaniu dostępu do zabezpieczonej strony, Middleware sprawdza ważność tokenu sesji
- **Odświeżanie Tokenu**: Gdy token wygasa, system automatycznie próbuje go odświeżyć przy pomocy refresh tokenu
- **Przechowywanie Tokenu**: Token sesji jest przechowywany w localStorage przeglądarki
- **Zabezpieczenia**: Wykorzystywany jest mechanizm Row Level Security (RLS) Supabase dla dodatkowej ochrony danych

### 4. Kroki Autentykacji

#### Rejestracja:
1. Użytkownik wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła)
2. System waliduje dane po stronie klienta
3. Dane są wysyłane do Supabase Auth
4. Supabase rejestruje użytkownika i zwraca token sesji
5. Token jest zapisywany w localStorage
6. Użytkownik jest przekierowywany do panelu głównego

#### Logowanie:
1. Użytkownik wypełnia formularz logowania (email, hasło)
2. System waliduje dane po stronie klienta
3. Dane są wysyłane do Supabase Auth
4. Supabase weryfikuje dane i zwraca token sesji
5. Token jest zapisywany w localStorage
6. Użytkownik jest przekierowywany do panelu głównego

#### Sprawdzanie Sesji:
1. Middleware pobiera token sesji z localStorage
2. Middleware weryfikuje ważność tokenu
3. Jeśli token jest ważny, użytkownik ma dostęp do zabezpieczonych stron
4. Jeśli token jest nieważny, middleware próbuje odświeżyć token
5. Jeśli odświeżenie nie powiedzie się, użytkownik jest przekierowywany do strony logowania

#### Wylogowanie:
1. Użytkownik klika przycisk "Wyloguj"
2. System wywołuje `supabase.auth.signOut()`
3. Token sesji jest usuwany z localStorage
4. Użytkownik jest przekierowywany do strony głównej

#### Usunięcie Konta:
1. Użytkownik klika "Usuń konto" i potwierdza decyzję
2. System wywołuje funkcję RPC Supabase do usunięcia danych użytkownika
3. Konto jest usuwane wraz z powiązanymi danymi
4. Sesja użytkownika jest kończona
5. Użytkownik jest przekierowywany do strony głównej
   </authentication_analysis>

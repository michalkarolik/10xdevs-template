# Dokument wymagań produktu (PRD) - AI Flashcard Generator

## 1. Przegląd produktu

Celem produktu jest stworzenie aplikacji webowej (MVP) o nazwie "AI Flashcard Generator", która ułatwi studentom tworzenie fiszek edukacyjnych. Aplikacja wykorzysta AI (Gemini) do generowania fiszek na podstawie tekstu wklejonego przez użytkownika, znacząco redukując czasochłonność tego procesu. Dodatkowo, pomoże użytkownikom w identyfikacji kluczowych informacji w materiale źródłowym. Aplikacja będzie oferować podstawowe funkcje zarządzania fiszkami, system kont użytkowników oraz integrację z gotowym algorytmem powtórek typu open-source.

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje aplikacja, jest czasochłonność i pracochłonność manualnego tworzenia wysokiej jakości fiszek edukacyjnych. Ten proces często zniechęca studentów do korzystania z efektywnej metody nauki, jaką jest spaced repetition. Dodatkowym problemem jest niepewność studentów co do tego, które informacje z danego materiału są najważniejsze i powinny zostać zamienione na fiszki. Aplikacja ma na celu zautomatyzowanie części tego procesu i wsparcie w identyfikacji kluczowych treści.

## 3. Wymagania funkcjonalne

*   FR-001: Rejestracja i logowanie użytkowników za pomocą loginu i hasła.
*   FR-002: Możliwość usunięcia konta użytkownika wraz ze wszystkimi powiązanymi danymi (fiszki, tematy).
*   FR-003: Możliwość tworzenia, edycji nazw i usuwania tematów (np. "Biologia Molekularna", "Historia Średniowiecza") do grupowania fiszek.
*   FR-004: Możliwość wklejenia tekstu przez użytkownika jako źródła do generowania fiszek.
*   FR-005: Generowanie fiszek (awers/rewers) przez AI Gemini na podstawie wklejonego tekstu po kliknięciu przycisku "Generuj".
*   FR-006: Ścisłe egzekwowanie limitów znaków dla fiszek: 100 znaków dla awersu i 500 znaków dla rewersu. Limity obowiązują zarówno fiszki generowane przez AI, jak i tworzone/edytowane manualnie.
*   FR-007: Informowanie użytkownika, gdy wygenerowana przez AI treść fiszki przekracza limit znaków. Użytkownik musi edytować treść, aby zmieściła się w limitach przed zapisaniem fiszki.
*   FR-008: Interfejs oceny wygenerowanych przez AI fiszek, zawierający przyciski: "OK" (akceptuj), "Wygeneruj nową" (poproś AI o inną wersję na podstawie tego samego tekstu źródłowego), "Edytuj" (przejdź do edycji manualnej).
*   FR-009: Możliwość ręcznego tworzenia nowych fiszek (wpisanie awersu i rewersu) w ramach wybranego tematu.
*   FR-010: Możliwość edycji tekstu awersu i rewersu istniejących fiszek.
*   FR-011: Możliwość usuwania pojedynczych fiszek.
*   FR-012: Przeglądanie listy tematów stworzonych przez użytkownika.
*   FR-013: Przeglądanie fiszek w ramach wybranego tematu.
*   FR-014: Integracja z wybranym algorytmem powtórek open-source w celu umożliwienia sesji nauki (prezentowanie fiszek do powtórki, mechanizm oceny znajomości). Szczegóły interfejsu zależne od wybranego algorytmu.
*   FR-015: Wyświetlanie przyjaznych dla użytkownika komunikatów o błędach (np. problem z API Gemini, błędy walidacji) zamiast surowych błędów technicznych.

## 4. Granice produktu

Następujące funkcjonalności NIE wchodzą w zakres MVP:

*   Opracowanie własnego, zaawansowanego algorytmu powtórek (jak np. w SuperMemo czy Anki). Zostanie użyte gotowe rozwiązanie open-source.
*   Import fiszek lub materiałów źródłowych z plików (np. PDF, DOCX, CSV). Jedynym źródłem danych jest tekst wklejany przez użytkownika.
*   Przetwarzanie linków URL w celu pobrania treści do generowania fiszek.
*   Współdzielenie tematów lub zestawów fiszek między użytkownikami.
*   Integracje z innymi platformami edukacyjnymi lub narzędziami (np. LMS, kalendarze).
*   Dedykowane aplikacje mobilne (iOS, Android). Produkt będzie dostępny jako aplikacja webowa.
*   Zaawansowane formatowanie tekstu na fiszkach (np. pogrubienie, kursywa, listy).
*   Możliwość dodawania obrazów lub dźwięków do fiszek.
*   Tryb offline.

## 5. Historyjki użytkowników

### Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji używając unikalnego loginu i hasła, abym mógł zacząć tworzyć i przechowywać swoje fiszki.
- Kryteria akceptacji:
    - Formularz rejestracji zawiera pola na login, hasło i potwierdzenie hasła.
    - System sprawdza, czy login nie jest już zajęty.
    - System sprawdza, czy hasła w obu polach są identyczne.
    - Hasło musi spełniać minimalne wymagania bezpieczeństwa (np. długość).
    - Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do panelu głównego lub procesu onboardingu.
    - W przypadku błędu (np. zajęty login, niespełnione wymagania hasła) wyświetlany jest czytelny komunikat.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji używając mojego loginu i hasła, abym mógł uzyskać dostęp do moich fiszek i funkcji aplikacji.
- Kryteria akceptacji:
    - Formularz logowania zawiera pola na login i hasło.
    - Po poprawnym wprowadzeniu danych użytkownik jest zalogowany i przekierowany do panelu głównego.
    - W przypadku błędnych danych (nieprawidłowy login lub hasło) wyświetlany jest czytelny komunikat.
    - Istnieje mechanizm typu "zapomniałem hasła" (poza MVP, ale warto zanotować).

- ID: US-003
- Tytuł: Usuwanie konta
- Opis: Jako zarejestrowany użytkownik, chcę móc trwale usunąć swoje konto wraz ze wszystkimi moimi danymi (fiszki, tematy), abym miał kontrolę nad moją prywatnością.
- Kryteria akceptacji:
    - W ustawieniach konta dostępna jest opcja usunięcia konta.
    - Przed usunięciem użytkownik musi potwierdzić swoją decyzję -dodatkowy przycisk potwierdzający.
    - Po potwierdzeniu, konto użytkownika oraz wszystkie powiązane z nim dane (użytkownik, tematy, fiszki) są trwale usuwane z bazy danych.
    - Użytkownik jest informowany o pomyślnym usunięciu konta i wylogowywany.

### Zarządzanie Tematami i Fiszkami

- ID: US-006
- Tytuł: Tworzenie nowego tematu
- Opis: Jako użytkownik, chcę móc tworzyć nowe tematy (np. "Biologia", "Programowanie"), abym mógł logicznie grupować moje fiszki.
- Kryteria akceptacji:
    - Istnieje przycisk lub opcja "Dodaj nowy temat".
    - Po kliknięciu pojawia się pole do wpisania nazwy tematu.
    - Po zatwierdzeniu nazwy, nowy temat pojawia się na liście tematów użytkownika.
    - Nazwa tematu nie może być pusta.

- ID: US-007
- Tytuł: Przeglądanie tematów i fiszek
- Opis: Jako użytkownik, chcę móc przeglądać listę moich tematów, a po wybraniu tematu, widzieć wszystkie fiszki w nim zawarte, abym mógł zarządzać moją bazą wiedzy.
- Kryteria akceptacji:
    - W interfejsie widoczna jest lista tematów stworzonych przez użytkownika.
    - Kliknięcie na nazwę tematu wyświetla listę fiszek należących do tego tematu.
    - Widok fiszki na liście pokazuje przynajmniej jej awers (lub fragment).

- ID: US-008
- Tytuł: Ręczne tworzenie fiszki
- Opis: Jako użytkownik, chcę móc ręcznie stworzyć nową fiszkę w wybranym temacie, wpisując tekst na awersie i rewersie, abym mógł dodawać własne definicje lub pytania.
- Kryteria akceptacji:
    - W widoku tematu istnieje przycisk lub opcja "Dodaj nową fiszkę".
    - Po kliknięciu pojawia się formularz z polami na tekst awersu i rewersu.
    - System waliduje, czy długość tekstu w polach Awers i Rewers nie przekracza limitów (1000/5000 znaków).
    - Po zapisaniu, nowa fiszka jest dodawana do bieżącego tematu i widoczna na liście.
    - W przypadku przekroczenia limitu znaków, wyświetlany jest błąd i fiszka nie jest zapisywana dopóki użytkownik nie skróci tekstu.

- ID: US-009
- Tytuł: Edycja istniejącej fiszki
- Opis: Jako użytkownik, chcę móc edytować tekst awersu i rewersu moich istniejących fiszek, abym mógł poprawić błędy lub zaktualizować informacje.
- Kryteria akceptacji:
    - Przy każdej fiszce (na liście lub w widoku szczegółowym) istnieje opcja "Edytuj".
    - Po kliknięciu "Edytuj" użytkownik może modyfikować tekst awersu i rewersu.
    - System waliduje, czy długość edytowanego tekstu nie przekracza limitów (1000/5000 znaków).
    - Po zapisaniu zmian, fiszka jest zaktualizowana.
    - W przypadku przekroczenia limitu znaków, wyświetlany jest błąd i zmiany nie są zapisywane dopóki użytkownik nie skróci tekstu.

- ID: US-010
- Tytuł: Usuwanie fiszki
- Opis: Jako użytkownik, chcę móc usunąć pojedynczą fiszkę, której już nie potrzebuję, abym mógł utrzymać porządek w moich materiałach.
- Kryteria akceptacji:
    - Przy każdej fiszce istnieje opcja "Usuń".
    - Po kliknięciu "Usuń" system prosi o potwierdzenie (np. "Czy na pewno chcesz usunąć tę fiszkę?").
    - Po potwierdzeniu, fiszka jest trwale usuwana z bazy danych i znika z listy w danym temacie.

### Generowanie Fiszek przez AI

- ID: US-011
- Tytuł: Inicjowanie generowania fiszek AI
- Opis: Jako użytkownik, chcę móc wkleić fragment tekstu (np. z notatek, artykułu) i zainicjować proces generowania fiszek przez AI, abym mógł szybko stworzyć materiały do nauki.
- Kryteria akceptacji:
    - W interfejsie (np. w widoku tematu lub dedykowanej sekcji) znajduje się pole tekstowe do wklejenia tekstu źródłowego.
    - Istnieje przycisk "Generuj fiszki".
    - Po wklejeniu tekstu i kliknięciu przycisku, system wysyła tekst do API Gemini w celu wygenerowania propozycji fiszek.
    - Użytkownik widzi informację zwrotną, że proces generowania trwa (np. loader).

- ID: US-012
- Tytuł: Ocena wygenerowanej fiszki AI - Akceptacja ("OK")
- Opis: Jako użytkownik, przeglądając propozycje fiszek od AI, chcę móc zaakceptować fiszkę przyciskiem "OK", jeśli jest ona dla mnie wartościowa, aby została zapisana na moim koncie.
- Kryteria akceptacji:
    - Dla każdej wygenerowanej przez AI propozycji fiszki widoczny jest przycisk "OK".
    - Kliknięcie "OK" powoduje zapisanie fiszki w wybranym (lub bieżącym) temacie.
    - Zapisana fiszka pojawia się na liście fiszek w temacie.
    - Akcja ta jest liczona na potrzeby metryki sukcesu "Akceptacja fiszek AI".

- ID: US-013
- Tytuł: Ocena wygenerowanej fiszki AI - Regeneracja ("Wygeneruj nową")
- Opis: Jako użytkownik, przeglądając propozycje fiszek od AI, chcę móc kliknąć "Wygeneruj nową", jeśli propozycja mi nie odpowiada, aby AI stworzyło alternatywną wersję fiszki na podstawie tego samego tekstu źródłowego.
- Kryteria akceptacji:
    - Dla każdej wygenerowanej przez AI propozycji fiszki widoczny jest przycisk "Wygeneruj nową".
    - Kliknięcie "Wygeneruj nową" powoduje wysłanie ponownego zapytania do API Gemini (z tym samym tekstem źródłowym, potencjalnie z dodatkowym promptem sugerującym inną wersję).
    - Aktualna propozycja fiszki jest zastępowana nową, wygenerowaną przez AI.
    - Użytkownik może ponownie ocenić nową propozycję ("OK", "Wygeneruj nową", "Edytuj").

- ID: US-014
- Tytuł: Ocena wygenerowanej fiszki AI - Edycja ("Edytuj")
- Opis: Jako użytkownik, przeglądając propozycje fiszek od AI, chcę móc kliknąć "Edytuj", jeśli fiszka jest bliska ideału, ale wymaga drobnych poprawek, abym mógł ją dostosować i zapisać.
- Kryteria akceptacji:
    - Dla każdej wygenerowanej przez AI propozycji fiszki widoczny jest przycisk "Edytuj".
    - Kliknięcie "Edytuj" otwiera interfejs edycji fiszki (taki sam jak dla US-009) z polami Awers/Rewers wypełnionymi treścią zaproponowaną przez AI.
    - Użytkownik może zmodyfikować tekst.
    - Po zapisaniu zmian (z uwzględnieniem limitów znaków), fiszka jest zapisywana w wybranym temacie.

- ID: US-015
- Tytuł: Obsługa przekroczenia limitu znaków przez AI
- Opis: Jako użytkownik, jeśli AI wygeneruje fiszkę, której treść (awers lub rewers) przekracza dozwolone limity znaków (1000/5000), chcę zostać o tym poinformowany i zmuszony do edycji przed zapisaniem, aby zapewnić spójność danych.
- Kryteria akceptacji:
    - System sprawdza długość awersu i rewersu każdej fiszki wygenerowanej przez AI przed jej wyświetleniem użytkownikowi do oceny.
    - Jeśli limit jest przekroczony, przy propozycji fiszki wyświetlany jest wyraźny komunikat informujący o przekroczeniu limitu i konieczności edycji.
    - Przycisk "OK" jest nieaktywny lub ukryte dla takiej fiszki.
    - Jedynymi akcjami są "Wygeneruj nową" i "Edytuj"
    - Po przejściu do edycji, użytkownik musi skrócić tekst do wymaganych limitów, aby móc zapisać fiszkę.

### Nauka z Powtórkami

- ID: US-016
- Tytuł: Rozpoczęcie sesji nauki
- Opis: Jako użytkownik, chcę móc rozpocząć sesję nauki dla wybranego tematu lub wszystkich moich fiszek, abym mógł utrwalać wiedzę za pomocą algorytmu powtórek.
- Kryteria akceptacji:
    - Istnieje przycisk lub opcja "Rozpocznij naukę" (dostępna globalnie lub w widoku tematu).
    - Po kliknięciu, system (korzystając z zintegrowanego algorytmu open-source) wybiera fiszki, które powinny zostać powtórzone w danej sesji.
    - Rozpoczyna się interfejs sesji nauki, prezentujący pierwszą fiszkę do powtórki (zazwyczaj tylko awers).

- ID: US-017
- Tytuł: Przeprowadzenie powtórki fiszki
- Opis: Jako użytkownik w trakcie sesji nauki, chcę widzieć awers fiszki, móc odsłonić rewers, a następnie ocenić swoją znajomość tej fiszki, aby algorytm mógł zaplanować kolejną powtórkę.
- Kryteria akceptacji:
    - Interfejs sesji nauki wyświetla awers fiszki.
    - Istnieje przycisk lub akcja "Pokaż odpowiedź" / "Odsłoń rewers".
    - Po odsłonięciu rewersu, pojawiają się opcje oceny znajomości (np. "Nie wiem", "Trudne", "Dobre", "Łatwe" - zależne od wybranego algorytmu).
    - Użytkownik wybiera jedną z opcji oceny.
    - Na podstawie oceny, algorytm powtórek aktualizuje stan fiszki i planuje jej następną powtórkę.
    - System przechodzi do kolejnej fiszki w sesji lub kończy sesję, jeśli nie ma więcej fiszek do powtórzenia.

### Obsługa Błędów

- ID: US-018
- Tytuł: Wyświetlanie błędów API Gemini
- Opis: Jako użytkownik, w przypadku problemów z komunikacją z API Gemini podczas generowania fiszek, chcę zobaczyć przyjazny komunikat o błędzie zamiast technicznych szczegółów, abym wiedział, że wystąpił problem, ale nie był zdezorientowany.
- Kryteria akceptacji:
    - Gdy API Gemini zwróci błąd (np. niedostępność, błąd wewnętrzny, przekroczenie limitów API), system przechwytuje ten błąd.
    - Zamiast wyświetlać surową odpowiedź API, system pokazuje użytkownikowi zrozumiały komunikat (np. "Nie udało się wygenerować fiszek. Spróbuj ponownie później." lub "Wystąpił chwilowy problem z generowaniem fiszek.").
    - Komunikat nie blokuje całkowicie aplikacji, użytkownik może spróbować ponownie lub wykonać inne akcje.

## 6. Metryki sukcesu

Kluczowe wskaźniki (KPI), które będą mierzyć sukces MVP:

1.  Akceptacja fiszek AI:
    - Cel: 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika.
    - Sposób mierzenia: (Liczba kliknięć przycisku "OK" dla fiszek wygenerowanych przez AI) / (Całkowita liczba unikalnych propozycji fiszek wygenerowanych przez AI i przedstawionych użytkownikowi do oceny) * 100%.

2.  Wykorzystanie AI w tworzeniu fiszek:
    - Cel: Użytkownicy tworzą 75% wszystkich swoich fiszek z wykorzystaniem funkcji generowania przez AI.
    - Sposób mierzenia: (Liczba fiszek zapisanych na kontach użytkowników, które pochodzą z generowania AI - tj. zostały zaakceptowane przyciskiem "OK" lub zapisane po kliknięciu "Edytuj" na propozycji AI) / (Całkowita liczba fiszek na kontach użytkowników - wliczając te stworzone przez AI i te stworzone manualnie) * 100%.

```

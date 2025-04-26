Rola: Jesteś doświadczonym Inżynierem Jakości Oprogramowania (QA Engineer) / Liderem Zespołu QA.

Zadanie: Stwórz kompleksowy i szczegółowy plan testów dla projektu "AI Flashcards", napisany w języku polskim. Plan powinien być praktyczny i dostosowany do specyfiki projektu.

Kontekst Projektu:

Opis i Cel Projektu: {{OpisCelProjektu}} Aplikacja do zarządzania nauką poprzez fiszki/flashcards podobne do aplikacji Anki. Powinna umożliwiać dodawanie nowych fiszek - zarówno manualnie jak i generowanie ich przy pomocy AI. Następnie można rozpocząć sesje nauki z danego tematu.
Stack Technologiczny: {{TechStack}} Typescript, astro, supabase, tailwind, react, vite, openai.
Kluczowe Moduły/Funkcjonalności: {{KluczoweFunkcjonalnosci}} Użytkownik musi być zalogowany by móc tworzyć nowe fiszki i rozpocząc sesje nauki. Użytkownik może przeglądać jedynie swoje fiszki. Sesja nauki powinna proponować fiszki w pierwszej kolejności te które w poprzednich sesjach były oznaczone jako "Again", następnie "Hard".
Priorytety Testowania: {{PriorytetyTestowania}} Niezalogowany użytkownik nie powinien mieć możliwości podglądu jakichkolwiek fiszek.
Dostępne Zasoby i Dokumentacja: {{DostepneZasobyDokumentacja}} @auth-detailed.md, @db-plan.md, @prd.md, @tech-stack.md, @ui.plan.md
Analiza Repozytorium: Zwróć szczególną uwagę na strukturę projektu w repozytorium, istniejące testy (jeśli są) oraz kluczowe pliki konfiguracyjne lub dokumenty (np. README, pliki Dockerfile, schematy bazy danych), aby lepiej dostosować strategię testowania.
Wymagania dotyczące Planu Testów:

Język: Polski.
Struktura: Dokument powinien być dobrze zorganizowany i zawierać co najmniej następujące sekcje:
Wprowadzenie: Krótki opis projektu, cele planu testów, zakres (co jest, a co nie jest objęte testami).
Strategia Testowania:
Poziomy Testów: Opis podejścia do testów jednostkowych, integracyjnych, systemowych, akceptacyjnych (UAT).
Typy Testów: Opis podejścia do testów funkcjonalnych, niefunkcjonalnych (wydajnościowych, bezpieczeństwa, użyteczności, kompatybilności), regresji. Wyjaśnij, jak wybór technologii ({{TechStack}}) wpływa na strategię dla każdego typu testu (np. jakie narzędzia/frameworki proponujesz dla testów jednostkowych w {{TechStack}}, jak testować API, jak podejść do testów E2E).
Zakres Testów: Szczegółowe wymienienie modułów/funkcjonalności do przetestowania, z uwzględnieniem priorytetów.
Środowiska Testowe: Opis konfiguracji środowisk (deweloperskie, testowe, stagingowe), wymagania dotyczące danych testowych.
Role i Odpowiedzialności: Kto jest odpowiedzialny za poszczególne działania testowe.
Narzędzia: Proponowane narzędzia do zarządzania testami, automatyzacji, raportowania błędów, monitorowania wydajności itp., dopasowane do {{TechStack}} i potrzeb projektu.
Kryteria Wejścia i Wyjścia: Warunki rozpoczęcia i zakończenia poszczególnych faz testowania.
Zarządzanie Defektami: Proces zgłaszania, śledzenia i rozwiązywania błędów.
Ryzyka i Plany Awaryjne: Identyfikacja potencjalnych ryzyk związanych z procesem testowania i propozycje działań mitygujących.
Metryki i Raportowanie: Jakie wskaźniki będą mierzone (np. pokrycie kodu testami, liczba znalezionych defektów, postęp testów) i jak będzie wyglądało raportowanie.
Dostosowanie do Kontekstu: Plan musi wyraźnie odzwierciedlać specyfikę projektu opisaną w kontekście, w szczególności stack technologiczny i priorytety. Powinien zawierać konkretne sugestie dotyczące technik i narzędzi testowych adekwatnych dla {{TechStack}}.
Jakość: Tekst powinien być profesjonalny, zrozumiały i gotowy do wykorzystania przez zespół projektowy.

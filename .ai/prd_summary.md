<conversation_summary>
<decisions>

1.  **Główny użytkownik docelowy:** Studenci poszukujący przystępnych metod nauki.
2.  **Problem dodatkowy:** Niepewność studentów co do kluczowych informacji w danym temacie.
3.  **Źródło danych dla AI:** Tekst wklejany przez użytkownika (notatki, fragmenty źródeł). Przetwarzanie linków URL zostało wyłączone z MVP.
4.  **Limity znaków fiszek:** Awers - 100 znaków, Rewers - 500 znaków. Limity są egzekwowane zawsze (dla AI i edycji manualnej); użytkownik jest informowany i musi edytować, jeśli limit zostanie przekroczony przez AI.
5.  **Algorytm powtórek:** Zostanie użyte rozwiązanie open-source, ale jego wybór jest odłożony. Kluczowym kryterium wyboru będzie łatwość integracji.
6.  **Organizacja fiszek:** Fiszki będą grupowane w tematy (np. nazwa przedmiotu).
7.  **Ocena fiszek AI:** Użytkownik będzie miał przyciski: "OK", "Wygeneruj nową", "Edytuj".
8.  **Metryka akceptacji AI:** Tylko kliknięcie "OK" liczy się jako akceptacja fiszki AI na potrzeby kryterium sukcesu (75% akceptacji).
9.  **Metryka użycia AI:** 75% wszystkich utworzonych fiszek (licząc liczbę fiszek) ma pochodzić z generowania AI.
10. **Edycja fiszek:** Możliwość edycji tekstu na awersie i rewersie.
11. **Regeneracja fiszek:** Opcja "Wygeneruj nową" poprosi AI (Gemini) o stworzenie alternatywnej wersji fiszki na podstawie tego samego fragmentu tekstu.
12. **Model AI:** Zostanie użyte API Gemini.
13. **System kont:** Prosty system login/hasło. Możliwość usunięcia konta wraz ze wszystkimi danymi.
14. **Prywatność:** Nie będzie specjalnych ostrzeżeń dotyczących użycia API Gemini poza standardową polityką prywatności.
15. **Onboarding:** Przy pierwszym uruchomieniu aplikacja zada użytkownikowi otwarte pytanie o zainteresowania. Na podstawie analizy odpowiedzi AI wygeneruje 3 startowe fiszki.
16. **Komunikaty o błędach:** Będą wyświetlane przyjazne dla użytkownika komunikaty, a nie surowe błędy API.
    </decisions>

<matched_recommendations>

1.  **Zdefiniować persony użytkowników:** Decyzja o skupieniu się na studentach. (Rekomendacja 1.2)
2.  **Wybór algorytmu powtórek:** Decyzja o użyciu open-source, ale odłożenie wyboru. (Rekomendacja 1.3, 2.3 - częściowo zrealizowane)
3.  **Prototyp/Proof-of-Concept AI:** Decyzja o użyciu Gemini i zdefiniowanie przepływu generowania/oceny. (Rekomendacja 1.4)
4.  **Makiety (Wireframes):** Potrzeba stworzenia makiet dla kluczowych przepływów (rejestracja, generowanie, ocena, przeglądanie, powtórki) jest nadal aktualna. (Rekomendacja 1.5, 2.4)
5.  **Definicja metryk sukcesu:** Jasno zdefiniowano sposób mierzenia obu kryteriów sukcesu. (Rekomendacja 1.6, 2.1)
6.  **Obsługa linków:** Podjęto decyzję o wyłączeniu z MVP. (Rekomendacja 2.2, 3.2)
7.  **User Stories:** Potrzeba opracowania szczegółowych user stories dla kluczowych przepływów jest nadal aktualna. (Rekomendacja 2.5)
8.  **Wymagania API Gemini:** Potrzeba zbadania limitów i możliwości API Gemini (zwłaszcza w kontekście regeneracji) jest nadal aktualna. (Rekomendacja 2.6, 3.8)
9.  **Strategia obsługi błędów:** Zdecydowano o przyjaznych komunikatach. (Rekomendacja 2.7, 3.4)
10. **Struktura bazy danych:** Potrzeba zdefiniowania struktury danych dla użytkowników, tematów i fiszek (uwzględniając przyszły algorytm powtórek) jest nadal aktualna. (Rekomendacja 2.8)
11. **Polityka prywatności/Regulamin:** Potrzeba ich przygotowania, informując o usuwaniu konta i (minimalnie) o AI. (Rekomendacja 2.9, 3.5)
12. **Limity znaków:** Ujednoznaczniono wymagania. (Rekomendacja 3.3)
13. **Mechanizm onboardingu:** Zdefiniowano podstawowy mechanizm. (Rekomendacja 3.6)
    </matched_recommendations>

<prd_planning_summary>
**Cel produktu:** Stworzenie aplikacji webowej (MVP), która ułatwi studentom tworzenie fiszek edukacyjnych poprzez generowanie ich przez AI (Gemini) na podstawie wklejonego tekstu, redukując czasochłonność tego procesu i pomagając w identyfikacji kluczowych informacji.

**Główne wymagania funkcjonalne:**

- Rejestracja i logowanie użytkowników (login/hasło).
- Możliwość usunięcia konta użytkownika wraz ze wszystkimi danymi.
- Onboarding: Zadanie pytania o zainteresowania i wygenerowanie 3 startowych fiszek przez AI.
- Wklejanie tekstu przez użytkownika.
- Generowanie fiszek (awers/rewers) przez AI Gemini na podstawie wklejonego tekstu.
- Ścisłe egzekwowanie limitów znaków (100/500) dla fiszek (generowanych i edytowanych). Informowanie użytkownika o przekroczeniu i wymuszanie edycji.
- Interfejs oceny wygenerowanych fiszek: przyciski "OK", "Wygeneruj nową", "Edytuj".
- Możliwość ręcznego tworzenia fiszek.
- Możliwość edycji istniejących fiszek (tekst awersu/rewersu).
- Możliwość usuwania fiszek.
- Przeglądanie fiszek pogrupowanych w tematy (definiowane przez użytkownika, np. nazwa przedmiotu).
- Integracja z (jeszcze niewybranym) algorytmem powtórek open-source do planowania sesji nauki.
- Wyświetlanie przyjaznych komunikatów o błędach.

**Kluczowe historie użytkownika i ścieżki korzystania:**

1.  **Rejestracja i Onboarding:** Nowy użytkownik rejestruje się za pomocą loginu i hasła. Przy pierwszym logowaniu odpowiada na pytanie o zainteresowania, a system generuje dla niego 3 startowe fiszki w odpowiednim temacie.
2.  **Generowanie fiszek przez AI:** Użytkownik wkleja fragment notatek do aplikacji. Klika przycisk generowania. AI przetwarza tekst i proponuje jedną lub więcej fiszek. Użytkownik przegląda propozycje. Dla każdej fiszki klika "OK" (akceptacja), "Wygeneruj nową" (prośba o inną wersję) lub "Edytuj" (ręczna poprawa). Jeśli AI wygeneruje treść przekraczającą limit, użytkownik jest informowany i musi ją edytować przed zapisaniem. Zaakceptowane ("OK") lub edytowane fiszki są zapisywane w wybranym temacie.
3.  **Ręczne tworzenie fiszek:** Użytkownik wybiera temat i klika opcję dodania nowej fiszki. Wpisuje tekst awersu i rewersu (przestrzegając limitów znaków) i zapisuje fiszkę.
4.  **Przeglądanie i Zarządzanie:** Użytkownik przegląda swoje tematy i fiszki wewnątrz nich. Może edytować lub usuwać pojedyncze fiszki.
5.  **Nauka z powtórkami:** Użytkownik inicjuje sesję nauki. System (korzystając z wybranego algorytmu) prezentuje fiszki do powtórki. Użytkownik ocenia swoją znajomość fiszki (mechanizm oceny zależny od wybranego algorytmu - np. "wiem", "nie wiem").
6.  **Usuwanie konta:** Użytkownik znajduje opcję w ustawieniach i potwierdza chęć usunięcia konta, co skutkuje trwałym usunięciem jego danych.

**Ważne kryteria sukcesu i sposoby ich mierzenia:**

1.  **Akceptacja fiszek AI:** 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika poprzez kliknięcie przycisku "OK". Mierzone jako (Liczba kliknięć "OK" na fiszkach AI) / (Łączna liczba wygenerowanych fiszek AI przedstawionych użytkownikowi).
2.  **Wykorzystanie AI:** Użytkownicy tworzą 75% swoich fiszek z wykorzystaniem AI. Mierzone jako (Liczba fiszek stworzonych przez AI i zaakceptowanych/edytowanych) / (Całkowita liczba fiszek stworzonych przez użytkownika - wliczając AI i manualne).

**Obszary poza zakresem MVP:**

- Zaawansowany algorytm powtórek (jak SuperMemo, Anki).
- Import z plików (PDF, DOCX itp.) oraz przetwarzanie linków URL.
- Współdzielenie zestawów fiszek.
- Integracje z innymi platformami.
- Aplikacje mobilne.
  </prd_planning_summary>

<unresolved_issues>

1.  **Wybór konkretnego algorytmu powtórek open-source:** Należy przeprowadzić research i dokonać wyboru, aby móc zaprojektować szczegóły integracji i interfejsu sesji nauki.
2.  **Szczegóły mechanizmu onboardingu:** Jak dokładnie będzie analizowana odpowiedź na otwarte pytanie o zainteresowania, aby wygenerować trafne 3 startowe fiszki? Jakie źródło danych zostanie użyte do ich generacji?
3.  **Szczegóły interfejsu użytkownika:** Wymagane jest stworzenie makiet/prototypów dla wszystkich kluczowych ekranów i przepływów.
4.  **Struktura bazy danych:** Wymaga zaprojektowania w szczegółach, uwzględniając przyszły algorytm powtórek.
5.  **Dokładne promptowanie Gemini:** Jakie prompty zostaną użyte do generowania fiszek i obsługi prośby "Wygeneruj nową", aby zapewnić jakość i różnorodność?
    </unresolved_issues>
    </conversation_summary>

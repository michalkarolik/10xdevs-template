import { useCallback, useEffect, useState } from "react";
import type { Flashcard, TopicDetailDto, TopicSummaryDto } from "@/types"; // Dodano TopicDetailDto

export enum SessionState {
  IDLE = "idle",
  LOADING_FLASHCARDS = "loading_flashcards",
  SHOWING_FRONT = "showing_front",
  SHOWING_BACK = "showing_back",
  FINISHED = "finished",
  ERROR = "error",
}

export function useLearningSession(topics: TopicSummaryDto[] = []) {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedTopicName, setSelectedTopicName] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const currentCard = flashcards?.length > 0 ? flashcards[currentCardIndex] : null;

  // Effect to set the topic name when topic ID changes
  useEffect(() => {
    if (selectedTopicId && topics?.length > 0) {
      const topic = topics.find((t) => t.id === selectedTopicId);
      if (topic) {
        setSelectedTopicName(topic.name);
      }
    }
  }, [selectedTopicId, topics]);

  const startSession = useCallback(
    async (topicId: string) => {
      try {
        setSessionState(SessionState.LOADING_FLASHCARDS);
        setError(null);

        // Find topic name from the topics array
        const topic = topics?.find((t) => t.id === topicId);
        setSelectedTopicId(topicId);
        setSelectedTopicName(topic?.name || "Selected Topic");

        // API call to load flashcards
        console.log(`Fetching topic details (including flashcards) for topic: ${topicId}`);

        // Use a relative URL instead of an absolute one - works better across environments
        // Zmieniono URL na endpoint zwracający szczegóły tematu (w tym fiszki)
        const apiUrl = `/api/topics/${topicId}`;
        console.log(`Trying to fetch from: ${apiUrl}`);
        // To debug API issues, fetch with more options
        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`API error (${response.status}):`, errorData);
          throw new Error(errorData.message || `Failed to fetch topic details (${response.status})`);
        }

        // Oczekujemy obiektu TopicDetailDto, który zawiera tablicę flashcards
        const data: TopicDetailDto = await response.json();
        console.log(`Received topic details:`, data);

        // Sprawdź, czy odpowiedź ma oczekiwaną strukturę i zawiera tablicę flashcards
        if (!data || typeof data !== "object" || !Array.isArray(data.flashcards)) {
          console.error("Invalid response format. Expected object with flashcards array:", data);
          throw new Error("Invalid response format received from server");
        }

        if (data.flashcards.length === 0) {
          // Można rozważyć inną obsługę - np. informacja dla użytkownika zamiast błędu
          setError("No flashcards available for this topic.");
          setSessionState(SessionState.ERROR); // Ustaw stan błędu, ale nie rzucaj wyjątku, aby umożliwić reset
          return; // Zakończ funkcję startSession
          // throw new Error('No flashcards available for this topic'); // Alternatywnie, rzuć błąd
        }

        setFlashcards(data.flashcards);
        setCurrentCardIndex(0);

        // --- Create Learning Session via API ---
        try {
          console.log("Creating new learning session for topic:", topicId);
          // Wywołujemy API, ale nie przekazujemy już topic_id w ciele,
          // ponieważ API go nie oczekuje (został usunięty z insertu)
          const sessionResponse = await fetch("/api/learning-sessions", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            // Body może być puste lub zawierać inne dane, jeśli API by ich wymagało
            // body: JSON.stringify({}), // Puste ciało, jeśli API nie wymaga niczego
            // LUB jeśli API *nadal* wymaga topic_id do walidacji, ale go nie zapisuje:
            body: JSON.stringify({ topic_id: topicId }), // Przesyłamy topic_id, jeśli walidacja w API go wymaga
          });

          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json().catch(() => ({}));
            console.error("Failed to create learning session:", errorData);
            setError(`Failed to create session: ${errorData.message || sessionResponse.status}`);
            // Rozważ ustawienie stanu błędu, jeśli sesja jest krytyczna
            // setSessionState(SessionState.ERROR);
            // return; // Można przerwać, jeśli sesja jest wymagana do kontynuacji
          } else {
            const sessionData = await sessionResponse.json();
            console.log("Learning session created:", sessionData);
            setSessionId(sessionData.session_id); // Zapisz ID sesji zwrócone przez API
          }
        } catch (sessionErr) {
          console.error("Network/fetch error creating session:", sessionErr);
          setError(
            sessionErr instanceof Error ? `Session creation failed: ${sessionErr.message}` : "Session creation failed"
          );
          // Rozważ ustawienie stanu błędu
          // setSessionState(SessionState.ERROR);
          // return;
        }
        // --- End Create Learning Session ---

        setSessionState(SessionState.SHOWING_FRONT);
      } catch (err) {
        console.error("Error fetching flashcards or starting session:", err);
        setError(err instanceof Error ? err.message : "Failed to start learning session");
        setSessionState(SessionState.ERROR);
      }
    },
    [topics]
  );

  const showAnswer = () => {
    if (sessionState === SessionState.SHOWING_FRONT) {
      setSessionState(SessionState.SHOWING_BACK);
    }
  };

  // Map frontend ratings to backend enum values defined in migration and API
  const ratingMap: Record<"bad" | "medium" | "good", "Again" | "Hard" | "Easy"> = {
    bad: "Again",
    medium: "Hard",
    good: "Easy",
  };

  const rateCard = useCallback(
    async (rating: "bad" | "medium" | "good") => {
      const cardToRate = flashcards[currentCardIndex];
      const userResponse = ratingMap[rating]; // Map to backend value ('Again', 'Hard', 'Easy')

      console.log(
        `Card rated: ${rating} (mapped to: ${userResponse}), Session ID: ${sessionId}, Card ID: ${cardToRate?.id}`
      );

      // --- Save Response via API ---
      // Sprawdź, czy mamy ID sesji i ID karty przed wysłaniem żądania
      if (sessionId && cardToRate?.id) {
        try {
          // Użyj endpointu zdefiniowanego w src/pages/api/learning-sessions/responses.ts
          const response = await fetch("/api/learning-sessions/responses", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              flashcard_id: cardToRate.id,
              user_response: userResponse, // Przekaż zmapowaną wartość
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Failed to save rating (${response.status}):`, errorData);
            // Opcjonalnie: Poinformuj użytkownika, ale kontynuuj działanie UI
            // setError(`Failed to save rating: ${errorData.message || response.status}`);
          } else {
            const responseData = await response.json();
            console.log("Rating saved successfully:", responseData);
          }
        } catch (err) {
          console.error("Network/fetch error saving rating:", err);
          // Opcjonalnie: Poinformuj użytkownika
          // setError(err instanceof Error ? `Rating save failed: ${err.message}` : 'Rating save failed');
        }
      } else {
        // Ostrzeżenie, jeśli brakuje ID sesji lub karty - ocena nie zostanie zapisana
        console.warn("Cannot save rating: Missing session ID or Card ID.", { sessionId, cardId: cardToRate?.id });
      }
      // --- End Save Response ---

      // Move to next card or finish session regardless of save success/failure
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
        setSessionState(SessionState.SHOWING_FRONT); // Reset to front for the next card
      } else {
        setSessionState(SessionState.FINISHED); // All cards reviewed
      }
    },
    [flashcards, currentCardIndex, sessionId]
  ); // Dodano brakującą tablicę zależności i nawias zamykający dla useCallback

  const resetSession = () => {
    setSessionState(SessionState.IDLE);
    setSelectedTopicId(null);
    setSelectedTopicName(null);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setError(null);
    setSessionId(null);
  };

  return {
    selectedTopicId,
    selectedTopicName,
    flashcards,
    currentCard,
    currentCardIndex,
    sessionState,
    error,
    startSession,
    showAnswer,
    rateCard, // Teraz opakowane w useCallback
    resetSession,
    sessionId,
  };
}

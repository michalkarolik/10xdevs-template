import { useState, useEffect, useCallback } from 'react';
import type { Flashcard, TopicSummaryDto, TopicDetailDto } from '@/types'; // Dodano TopicDetailDto

export enum SessionState {
  IDLE = 'idle',
  LOADING_FLASHCARDS = 'loading_flashcards',
  SHOWING_FRONT = 'showing_front',
  SHOWING_BACK = 'showing_back',
  FINISHED = 'finished',
  ERROR = 'error'
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
      const topic = topics.find(t => t.id === selectedTopicId);
      if (topic) {
        setSelectedTopicName(topic.name);
      }
    }
  }, [selectedTopicId, topics]);

  const startSession = useCallback(async (topicId: string) => {
    try {
      setSessionState(SessionState.LOADING_FLASHCARDS);
      setError(null);
      
      // Find topic name from the topics array
      const topic = topics?.find(t => t.id === topicId);
      setSelectedTopicId(topicId);
      setSelectedTopicName(topic?.name || 'Selected Topic');
      
      // API call to load flashcards
      console.log(`Fetching topic details (including flashcards) for topic: ${topicId}`);

      // Use a relative URL instead of an absolute one - works better across environments
      // Zmieniono URL na endpoint zwracający szczegóły tematu (w tym fiszki)
      const apiUrl = `/api/topics/${topicId}`;
      console.log(`Trying to fetch from: ${apiUrl}`);
      // To debug API issues, fetch with more options
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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
      if (!data || typeof data !== 'object' || !Array.isArray(data.flashcards)) {
        console.error("Invalid response format. Expected object with flashcards array:", data);
        throw new Error('Invalid response format received from server');
      }

      if (data.flashcards.length === 0) {
        // Można rozważyć inną obsługę - np. informacja dla użytkownika zamiast błędu
        setError('No flashcards available for this topic.');
        setSessionState(SessionState.ERROR); // Ustaw stan błędu, ale nie rzucaj wyjątku, aby umożliwić reset
        return; // Zakończ funkcję startSession
        // throw new Error('No flashcards available for this topic'); // Alternatywnie, rzuć błąd
      }

      // Create a unique session ID
      const newSessionId = `session_${Date.now()}`;

      setFlashcards(data.flashcards); // Użyj tablicy flashcards z odpowiedzi
      setCurrentCardIndex(0);
      setSessionId(newSessionId);
      setSessionState(SessionState.SHOWING_FRONT);
    } catch (err) {
      console.error("Error starting session:", err);
      setError(err instanceof Error ? err.message : 'Failed to start learning session');
      setSessionState(SessionState.ERROR);
    }
  }, [topics]);

  const showAnswer = () => {
    if (sessionState === SessionState.SHOWING_FRONT) {
      setSessionState(SessionState.SHOWING_BACK);
    }
  };

  const rateCard = (rating: 'bad' | 'medium' | 'good') => {
    console.log(`Card rated: ${rating}`);
    
    // Move to next card or finish session
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setSessionState(SessionState.SHOWING_FRONT); // Reset to front for the next card
    } else {
      setSessionState(SessionState.FINISHED); // All cards reviewed
    }
  };

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
    rateCard,
    resetSession,
    sessionId,
  };
}

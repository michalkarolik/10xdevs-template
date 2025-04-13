import { useState, useCallback, useMemo } from 'react';
import type { TopicSummaryDto, FlashcardResponseDto, TopicDetailDto } from '@/types';

export enum SessionState {
  SELECTING_TOPIC = 'SELECTING_TOPIC',
  LOADING_FLASHCARDS = 'LOADING_FLASHCARDS',
  SHOWING_FRONT = 'SHOWING_FRONT',
  SHOWING_BACK = 'SHOWING_BACK',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
}

export const useLearningSession = (initialTopics: TopicSummaryDto[]) => {
  const [topics] = useState<TopicSummaryDto[]>(initialTopics);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardResponseDto[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.SELECTING_TOPIC);
  const [error, setError] = useState<string | null>(null);

  const currentCard = useMemo(() => {
    return flashcards[currentCardIndex] ?? null;
  }, [flashcards, currentCardIndex]);

  const selectedTopicName = useMemo(() => {
    return topics.find(t => t.id === selectedTopicId)?.name ?? 'Unknown Topic';
  }, [topics, selectedTopicId]);

  const startSession = useCallback(async (topicId: string) => {
    if (!topicId) return;
    setSelectedTopicId(topicId);
    setSessionState(SessionState.LOADING_FLASHCARDS);
    setError(null);
    setFlashcards([]);
    setCurrentCardIndex(0);

    try {
      // Fetch flashcards for the selected topic
      // Assuming API endpoint /api/topics/[topic_id] returns TopicDetailDto which includes flashcards
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch flashcards: ${response.status} ${errorData?.error || response.statusText}`);
      }
      const topicDetail: TopicDetailDto = await response.json();

      if (!topicDetail.flashcards || topicDetail.flashcards.length === 0) {
        throw new Error("This topic has no flashcards to study.");
      }

      // TODO: Implement shuffling later if needed
      setFlashcards(topicDetail.flashcards);
      setSessionState(SessionState.SHOWING_FRONT);
    } catch (err) {
      console.error("Error starting session:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setSessionState(SessionState.ERROR);
    }
  }, []);

  const showAnswer = useCallback(() => {
    if (sessionState === SessionState.SHOWING_FRONT) {
      setSessionState(SessionState.SHOWING_BACK);
    }
  }, [sessionState]);

  const rateCard = useCallback((rating: 'good' | 'medium' | 'bad') => {
    if (sessionState !== SessionState.SHOWING_BACK) return;

    console.log(`Card ${currentCard?.id} rated as: ${rating}`); // Placeholder for rating logic

    // Move to the next card or finish session
    const nextIndex = currentCardIndex + 1;
    if (nextIndex < flashcards.length) {
      setCurrentCardIndex(nextIndex);
      setSessionState(SessionState.SHOWING_FRONT);
    } else {
      setSessionState(SessionState.FINISHED);
    }
  }, [sessionState, currentCardIndex, flashcards.length, currentCard?.id]);

  const resetSession = useCallback(() => {
    setSelectedTopicId(null);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setSessionState(SessionState.SELECTING_TOPIC);
    setError(null);
  }, []);

  return {
    topics,
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
  };
};

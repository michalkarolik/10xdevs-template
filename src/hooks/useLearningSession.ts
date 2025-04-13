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
    console.log('[useLearningSession] startSession called with topicId:', topicId);
    if (!topicId) {
      console.log('[useLearningSession] topicId is empty, returning.');
      return;
    }
    setSelectedTopicId(topicId); // Set selected topic ID immediately
    setSessionState(SessionState.LOADING_FLASHCARDS);
    setError(null);
    setFlashcards([]);
    setCurrentCardIndex(0);

    setCurrentCardIndex(0);
    console.log('[useLearningSession] State set to LOADING_FLASHCARDS for topic:', topicId);

    try {
      console.log(`[useLearningSession] Fetching flashcards from: /api/topics/${topicId}`);
      // Fetch flashcards for the selected topic
      // Assuming API endpoint /api/topics/[topic_id] returns TopicDetailDto which includes flashcards
      const response = await fetch(`/api/topics/${topicId}`);
      console.log('[useLearningSession] Fetch response status:', response.status);

      if (!response.ok) {
        let errorText = response.statusText;
        try {
          const errorData = await response.json();
          errorText = errorData?.error || errorText;
          console.error('[useLearningSession] Fetch error data:', errorData);
        } catch {
          // Ignore if response body is not JSON
        }
        throw new Error(`Failed to fetch flashcards: ${response.status} ${errorText}`);
      }

      const topicDetail: TopicDetailDto = await response.json();
      console.log('[useLearningSession] Fetched topic detail:', topicDetail);

      if (!topicDetail.flashcards || topicDetail.flashcards.length === 0) {
        console.log('[useLearningSession] Topic has no flashcards.');
        throw new Error("This topic has no flashcards to study.");
      }

      console.log(`[useLearningSession] Found ${topicDetail.flashcards.length} flashcards. Setting state to SHOWING_FRONT.`);
      // TODO: Implement shuffling later if needed
      setFlashcards(topicDetail.flashcards);
      setSessionState(SessionState.SHOWING_FRONT);
    } catch (err) {
      console.error("[useLearningSession] Error starting session:", err);
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

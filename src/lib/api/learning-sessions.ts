/**
 * API functions for learning sessions
 */

/**
 * Creates a new learning session for a topic
 * @param topicId The ID of the topic for the learning session
 * @returns The created session data
 */
export async function createLearningSession(topicId: string): Promise<{ session_id: string, created_at: string }> {
  const response = await fetch('/api/learning-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic_id: topicId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create learning session');
  }

  return response.json();
}

/**
 * Saves a user's response to a flashcard during a learning session
 * @param sessionId The ID of the learning session
 * @param flashcardId The ID of the flashcard
 * @param userResponse The user's response (Again, Hard, Easy)
 * @returns The saved response data
 */
export async function saveFlashcardResponse(
  sessionId: string,
  flashcardId: string,
  userResponse: 'Again' | 'Hard' | 'Easy'
): Promise<{ id: string, created_at: string }> {
  const response = await fetch('/api/learning-sessions/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      flashcard_id: flashcardId,
      user_response: userResponse,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save flashcard response');
  }

  return response.json();
}

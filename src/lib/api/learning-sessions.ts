/**
 * Save a flashcard response during a learning session
 */
export async function saveFlashcardResponse(
  sessionId: string,
  flashcardId: string,
  response: 'Again' | 'Hard' | 'Easy'
) {
  try {
    const apiResponse = await fetch(`/api/learning/session/${sessionId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_id: flashcardId,
        rating: response,
      }),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to save response');
    }

    return apiResponse.json();
  } catch (error) {
    console.error('Error saving flashcard response:', error);
    throw error;
  }
}

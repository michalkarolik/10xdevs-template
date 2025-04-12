import { useState, useCallback, useRef } from "react"; // Import useRef
import type {
  FlashcardSuggestionViewModel,
  FlashcardGeneratedDto,
  FlashcardGenerateDto,
  FlashcardGeneratedResponseDto,
  FlashcardAcceptDto,
  FlashcardAcceptResponseDto,
  FlashcardGenerateAlternativeDto,
  FlashcardGenerateAlternativeResponseDto,
  FlashcardAcceptEditedDto,
  FlashcardAcceptEditedResponseDto,
  ErrorResponse,
} from "@/types";

// Helper to handle API errors consistently
const handleApiError = async (response: Response, defaultMessage: string): Promise<string> => {
	if (response.ok) return defaultMessage; // Should not happen if called correctly, but safe check

	try {
		// Attempt to parse the error response body
		const errorData: ErrorResponse | { error: string; details?: any } | { message: string } = await response.json();

		if (typeof errorData === 'object' && errorData !== null) {
			// Check for Zod validation errors (status 400 from our API)
			if (response.status === 400 && 'error' in errorData && errorData.error === 'Invalid request body' && 'details' in errorData && Array.isArray(errorData.details) && errorData.details.length > 0) {
				// Extract the message from the first Zod issue
				const firstIssue = errorData.details[0];
				if (firstIssue && typeof firstIssue.message === 'string') {
					// Optionally include the field path:
					// const fieldPath = firstIssue.path?.join('.') || '';
					// return `Validation Error: ${fieldPath ? `${fieldPath}: ` : ''}${firstIssue.message}`;
					return `Validation Error: ${firstIssue.message}`; // Return the specific validation message
				}
			}

			// Check for standard { message: '...' } format
			if ('message' in errorData && typeof errorData.message === 'string') {
				return errorData.message;
			}

			// Check for simple { error: '...' } format
			if ('error' in errorData && typeof errorData.error === 'string') {
				return errorData.error;
			}
		}
	} catch (e) {
		// Ignore JSON parsing error, fall back to status text or default message
		console.error("Failed to parse error response:", e);
		return `${defaultMessage} (Status: ${response.status}${response.statusText ? ` - ${response.statusText}` : ''})`;
	}

	// Fallback if parsing failed or format was unexpected
	return `${defaultMessage} (Status: ${response.status}${response.statusText ? ` - ${response.statusText}` : ''})`;
};


export const useAIGeneration = (topicId: string) => {
  const [sourceText, setSourceText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<FlashcardSuggestionViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedCount, setAcceptedCount] = useState<number>(0); // State for accepted count
  const [lastAcceptedId, setLastAcceptedId] = useState<string | null>(null); // State for last accepted ID
  const acceptTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout

  const handleGenerate = useCallback(async () => {
    if (!sourceText || isLoading) return;

    setIsLoading(true);
    setError(null);
    console.log(`Generating flashcards for topic ${topicId} using new endpoint`);

    try {
      // Prepare request body according to the new endpoint's schema
      const requestBody = {
        sourceText: sourceText,
        topicId: topicId,
        // count: 5 // Można dodać opcję wyboru liczby fiszek w UI i przekazać ją tutaj
      };
      const response = await fetch(`/api/ai/generate-flashcards`, { // Use the new endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'Failed to generate flashcards');
        throw new Error(errorMessage);
      }

      // Expect response in the format { flashcards: [...] }
      const generatedResponse: { flashcards: Array<{ front: string; back: string }> } = await response.json();

      if (!generatedResponse || !Array.isArray(generatedResponse.flashcards)) {
         console.error("Invalid response format from generate API:", generatedResponse);
         throw new Error("Received invalid data structure from server.");
      }

      // Map the response to the updated ViewModel (without exceeds_limit)
      const newSuggestions: FlashcardSuggestionViewModel[] = generatedResponse.flashcards.map((dto) => ({
        id: crypto.randomUUID(), // Generate client-side ID
        front: dto.front,
        back: dto.back,
        // exceeds_limit is removed
        isEditing: false,
        originalFront: dto.front, // Store original for potential revert/edit
        originalBack: dto.back,
      }));
      setSuggestions(newSuggestions);

    } catch (err) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, topicId, isLoading]);

  const handleAccept = useCallback(async (suggestionId: string) => {
    setIsLoading(true); // Consider more granular loading
    setError(null);
    const suggestionToAccept = suggestions.find(s => s.id === suggestionId);
    if (!suggestionToAccept) {
        setError("Suggestion not found.");
        setIsLoading(false);
        setError("Suggestion not found.");
        setIsLoading(false);
        return;
    }
    console.log(`[handleAccept] Attempting to accept suggestion ID: ${suggestionId}`); // Log start

    try {
      console.log(`[handleAccept] Suggestion data:`, suggestionToAccept); // Log data being sent
      const requestBody: FlashcardAcceptDto = {
        front: suggestionToAccept.front,
        back: suggestionToAccept.back,
      };
      const response = await fetch(`/api/topics/${topicId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'Failed to accept suggestion');
        // Removed duplicate declaration of errorMessage
        console.error(`[handleAccept] API call failed for ID: ${suggestionId}. Status: ${response.status}`); // Log API failure
        throw new Error(errorMessage);
      }

      // const savedFlashcard: FlashcardAcceptResponseDto = await response.json();
      await response.json(); // Consume body even if not used directly
      console.log(`[handleAccept] API call successful for ID: ${suggestionId}`); // Log success

      // Clear previous timeout if exists
      if (acceptTimeoutRef.current) {
        clearTimeout(acceptTimeoutRef.current);
      }

      // Update accepted count and last accepted ID to show the visual feedback
      setAcceptedCount(prev => prev + 1);
      setLastAcceptedId(suggestionId);

      // Set timeout to clear the visual feedback AND remove the card after 500ms
      acceptTimeoutRef.current = setTimeout(() => {
        setLastAcceptedId(null); // Clear the visual feedback trigger

        // Remove the accepted suggestion from the list *inside* the timeout
        setSuggestions(prev => {
          console.log(`[handleAccept] Removing suggestion ID: ${suggestionId} after timeout`); // Log removal
          const newState = prev.filter(s => s.id !== suggestionId);
          console.log("[handleAccept] New suggestions state after removal:", newState); // Log new state
          return newState;
        });

        acceptTimeoutRef.current = null; // Clear the ref after execution
      }, 500); // 500ms delay

      // Note: The setSuggestions call that removes the card is now inside the setTimeout

    } catch (err) {
      console.error("[handleAccept] Error caught:", err); // Log caught error
      setError(err instanceof Error ? err.message : "An unknown error occurred during acceptance.");
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  }, [suggestions, topicId]);

  const handleRegenerate = useCallback(async (suggestionId: string) => {
     setIsLoading(true); // Consider more granular loading
     setError(null);
     const suggestionToRegenerate = suggestions.find(s => s.id === suggestionId);
     if (!suggestionToRegenerate || !suggestionToRegenerate.originalFront || !suggestionToRegenerate.originalBack) {
         setError("Suggestion data incomplete for regeneration.");
         setIsLoading(false);
         setIsLoading(false);
         return;
     }
     console.log(`Regenerating suggestion ${suggestionId}`);

     try {
        const requestBody: FlashcardGenerateAlternativeDto = {
            source_text: sourceText, // Assuming source text is still relevant
            original_front: suggestionToRegenerate.originalFront,
            original_back: suggestionToRegenerate.originalBack,
        };
        const response = await fetch(`/api/topics/${topicId}/generate/alternative`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response, 'Failed to regenerate suggestion');
            throw new Error(errorMessage);
        }

        const regeneratedData: FlashcardGenerateAlternativeResponseDto = await response.json();

        // Update the specific suggestion in the list
        setSuggestions(prev => prev.map(s =>
            s.id === suggestionId
                 ? { ...s, front: regeneratedData.front, back: regeneratedData.back, exceeds_limit: regeneratedData.exceeds_limit, originalFront: regeneratedData.front, originalBack: regeneratedData.back, isEditing: false }
                 : s // Corrected ternary operator - removed duplicate logic
         ));
     } catch (err) {
         console.error("Regeneration failed:", err);
         setError(err instanceof Error ? err.message : "An unknown error occurred during regeneration.");
     } finally {
         setIsLoading(false);
     }
  }, [suggestions, topicId, sourceText]); // Include sourceText if needed by API

  const handleEditToggle = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.map(s =>
      s.id === suggestionId ? { ...s, isEditing: !s.isEditing } : s
    ));
  }, []);

  const handleSaveEdit = useCallback(async (suggestionId: string, editedFront: string, editedBack: string) => {
    setIsLoading(true); // Consider more granular loading
    setError(null);
    console.log(`Saving edited suggestion ${suggestionId}`);

    try {
        const requestBody: FlashcardAcceptEditedDto = {
            front: editedFront,
            back: editedBack,
        };
        const response = await fetch(`/api/topics/${topicId}/accept-edited`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response, 'Failed to save edited suggestion');
            throw new Error(errorMessage);
        }

        // const savedFlashcard: FlashcardAcceptEditedResponseDto = await response.json();
        await response.json(); // Consume body

        // Remove the saved suggestion from the list
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

        // Redirect to the topic page after successful save
        window.location.href = `/topics/${topicId}`;

    } catch (err) {
        console.error("Saving edited suggestion failed:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
    } finally {
        setIsLoading(false);
    }
  }, [topicId]);

  const handleCancelEdit = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === suggestionId && s.isEditing) {
        // Revert to original values if available, otherwise keep current (though ideally original should always exist)
        return {
          ...s,
          front: s.originalFront ?? s.front,
          back: s.originalBack ?? s.back,
          isEditing: false,
          // Note: exceeds_limit should ideally be recalculated based on original values or kept as is if originals are missing
        };
      }
      return s;
    }));
  }, []);


  return {
    sourceText,
    suggestions,
    isLoading,
    error,
    setSourceText,
    handleGenerate,
    handleAccept,
    handleRegenerate,
    handleEditToggle,
    handleSaveEdit,
    handleCancelEdit,
    acceptedCount, // Return accepted count
    lastAcceptedId, // Return last accepted ID
  };
};

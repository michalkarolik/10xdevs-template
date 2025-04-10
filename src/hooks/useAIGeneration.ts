import { useState, useCallback } from "react";
import type { FlashcardSuggestionViewModel, FlashcardGeneratedDto } from "@/types"; // Assuming types.ts is updated

export const useAIGeneration = (topicId: string) => {
  const [sourceText, setSourceText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<FlashcardSuggestionViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!sourceText || isLoading) return;

    setIsLoading(true);
    setError(null);
    console.log(`Generating flashcards for topic ${topicId} with text: ${sourceText}`);

    try {
      // Placeholder for API call: POST /api/topics/{topicId}/generate
      // const response = await fetch(`/api/topics/${topicId}/generate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ source_text: sourceText }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to generate flashcards');
      // }
      // const generatedData: FlashcardGeneratedDto[] = await response.json();

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const generatedData: FlashcardGeneratedDto[] = [
        { front: "Simulated Front 1", back: "Simulated Back 1", exceeds_limit: false },
        { front: "Simulated Front 2 - This front is intentionally made very long to demonstrate the exceeds_limit flag functionality during development and testing.", back: "Simulated Back 2", exceeds_limit: true },
      ];


      const newSuggestions: FlashcardSuggestionViewModel[] = generatedData.map((dto) => ({
        id: crypto.randomUUID(), // Generate client-side ID
        front: dto.front,
        back: dto.back,
        exceeds_limit: dto.exceeds_limit,
        isEditing: false,
        originalFront: dto.front, // Store original for potential revert/regenerate
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
        return;
    }
    console.log(`Accepting suggestion ${suggestionId}:`, suggestionToAccept);
    // Placeholder for API call: POST /api/topics/{topicId}/accept
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
        setError("Failed to accept suggestion.");
    } finally {
        setIsLoading(false);
    }
  }, [suggestions, topicId]);

  const handleRegenerate = useCallback(async (suggestionId: string) => {
     setIsLoading(true); // Consider more granular loading
     setError(null);
     const suggestionToRegenerate = suggestions.find(s => s.id === suggestionId);
     if (!suggestionToRegenerate || !suggestionToRegenerate.originalFront || !suggestionToRegenerate.originalBack) {
         setError("Suggestion data incomplete for regeneration.");
         setIsLoading(false);
         return;
     }
     console.log(`Regenerating suggestion ${suggestionId}`);
     // Placeholder for API call: POST /api/topics/{topicId}/generate/alternative
     try {
         // Simulate API call
         await new Promise(resolve => setTimeout(resolve, 1000));
         const regeneratedData: FlashcardGeneratedDto = { front: `Regen Front ${Math.random().toFixed(2)}`, back: `Regen Back ${Math.random().toFixed(2)}`, exceeds_limit: false };

         setSuggestions(prev => prev.map(s =>
             s.id === suggestionId
                 ? { ...s, front: regeneratedData.front, back: regeneratedData.back, exceeds_limit: regeneratedData.exceeds_limit, originalFront: regeneratedData.front, originalBack: regeneratedData.back, isEditing: false }
                 : s
         ));
     } catch (err) {
         setError("Failed to regenerate suggestion.");
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
    console.log(`Saving edited suggestion ${suggestionId}:`, { editedFront, editedBack });
    // Placeholder for API call: POST /api/topics/{topicId}/accept-edited
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
        setError("Failed to save edited suggestion.");
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
  };
};

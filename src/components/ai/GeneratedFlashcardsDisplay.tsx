import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info } from "lucide-react"; // Icons
import FlashcardSuggestionCard from "./FlashcardSuggestionCard"; // Assuming this component exists
import type { FlashcardSuggestionViewModel } from "@/types";

interface GeneratedFlashcardsDisplayProps {
  suggestions: FlashcardSuggestionViewModel[];
  isLoading: boolean;
  error: string | null;
  onAccept: (suggestionId: string) => void;
  onRegenerate: (suggestionId: string) => void;
  onEditToggle: (suggestionId: string) => void;
  onSaveEdit: (suggestionId: string, editedFront: string, editedBack: string) => void;
  onCancelEdit: (suggestionId: string) => void;
}

const GeneratedFlashcardsDisplay: React.FC<GeneratedFlashcardsDisplayProps> = ({
  suggestions,
  isLoading,
  error,
  onAccept,
  onRegenerate,
  onEditToggle,
  onSaveEdit,
  onCancelEdit,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Generating suggestions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Suggestions</AlertTitle>
        <AlertDescription>
          No flashcard suggestions were generated. Try modifying your source text or generating again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Generated Suggestions</h2>
      {suggestions.map((suggestion) => (
        <FlashcardSuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={onAccept}
          onRegenerate={onRegenerate}
          onEditToggle={onEditToggle}
          onSaveEdit={onSaveEdit} // Pass down save handler
          onCancelEdit={onCancelEdit} // Pass down cancel handler
        />
      ))}
    </div>
  );
};

export default GeneratedFlashcardsDisplay;

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from "lucide-react"; // Icons
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
  lastAcceptedId?: string | null; // Add prop for last accepted ID
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
  lastAcceptedId, // Destructure the new prop
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
    // Added margin top, adjusted internal spacing
    <div className="space-y-6 mt-8">
      <h2 className="text-xl font-semibold border-b pb-2">Generated Suggestions</h2>
      {suggestions.map((suggestion) => (
        <FlashcardSuggestionCard
          key={suggestion.id} // Client-side ID is fine for key here
          suggestion={suggestion}
          onAccept={onAccept}
          onRegenerate={onRegenerate}
          onEditToggle={onEditToggle}
          onSaveEdit={onSaveEdit} // Pass down save handler
          onCancelEdit={onCancelEdit} // Pass down cancel handler
          lastAcceptedId={lastAcceptedId} // Pass last accepted ID to card
        />
      ))}
    </div>
  );
};

export default GeneratedFlashcardsDisplay;

import React from "react";
import { cn } from "@/lib/utils"; // Import cn utility
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, Edit, RefreshCw, CheckCircle } from "lucide-react"; // Added CheckCircle
import type { FlashcardSuggestionViewModel } from "@/types";
// Placeholder for Edit Form - will be implemented later
import FlashcardEditForm from './FlashcardEditForm';

interface FlashcardSuggestionCardProps {
  suggestion: FlashcardSuggestionViewModel;
  onAccept: (suggestionId: string) => void;
  onRegenerate: (suggestionId: string) => void;
  onEditToggle: (suggestionId: string) => void;
  onSaveEdit: (suggestionId: string, editedFront: string, editedBack: string) => void;
  onCancelEdit: (suggestionId: string) => void;
  lastAcceptedId?: string | null; // Add prop for last accepted ID
}

const FlashcardSuggestionCard: React.FC<FlashcardSuggestionCardProps> = ({
  suggestion,
  onAccept,
  onRegenerate,
  onEditToggle,
  onSaveEdit,
  onCancelEdit,
  lastAcceptedId, // Destructure the new prop
}) => {
  const handleAcceptClick = () => {
    onAccept(suggestion.id);
  };

  const handleRegenerateClick = () => {
    onRegenerate(suggestion.id);
  };

  const handleEditClick = () => {
    onEditToggle(suggestion.id);
  };

  // Placeholder handlers for edit form actions
  const handleSave = (editedFront: string, editedBack: string) => {
     console.log("Save clicked in card - passing up:", suggestion.id, editedFront, editedBack);
     onSaveEdit(suggestion.id, editedFront, editedBack);
  };

  const handleCancel = () => {
     console.log("Cancel clicked in card - passing up:", suggestion.id);
     onCancelEdit(suggestion.id);
  };


  // Removed isOkButtonDisabled calculation as exceeds_limit is no longer in ViewModel
  // const isOkButtonDisabled = suggestion.exceeds_limit && !suggestion.isEditing;
  const isOkButtonDisabled = false; // Re-enable button, limit check removed

  const showAcceptedCheck = suggestion.id === lastAcceptedId;

  return (
    // Apply conditional border instead of overlay
    <Card className={cn(
      "shadow-md transition-all duration-300", // General transition
      showAcceptedCheck ? "border-green-500 border-2" : "border-transparent border-2" // Conditional border
      // Removed relative positioning as overlay is gone
    )}>
      {/* Removed Accepted Checkmark Overlay */}
      {/* {showAcceptedCheck && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-100/70 dark:bg-green-900/70 rounded-xl z-10 pointer-events-none">
          <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 animate-pulse" />
        </div>
      )} */}

      <CardHeader className="pb-3"> {/* Reduced bottom padding */}
        <CardTitle className="text-lg">Suggested Flashcard</CardTitle> {/* Slightly smaller title */}
        {/* The exceeds_limit alert block has been completely removed */}
      </CardHeader>
      <CardContent className="space-y-3 pt-0"> {/* Removed top padding, adjusted spacing */}
        {suggestion.isEditing ? (
           <FlashcardEditForm
             initialFront={suggestion.front} // Pass initial values
             initialBack={suggestion.back}
             onSave={handleSave}
             onCancel={handleCancel}
           />
        ) : (
          <>
            {/* Improved display of front/back */}
            <div className="border-l-4 border-primary pl-3 py-1">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Front</h3>
              <p className="text-base whitespace-pre-wrap break-words">
                {suggestion.front}
              </p>
            </div>
            <div className="border-l-4 border-secondary pl-3 py-1">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Back</h3>
              <p className="text-base whitespace-pre-wrap break-words">
                {suggestion.back}
              </p>
            </div>
          </>
        )}
      </CardContent>
      {!suggestion.isEditing && (
         // Added flex-wrap for better responsiveness on small screens
        <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center" // Ensure icon and text align
            onClick={handleEditClick}
            aria-label="Edit suggested flashcard"
          >
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
          {/* Removed duplicate Edit button content and extra closing tag */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateClick}
            aria-label="Generate new version of suggested flashcard"
            className="flex items-center" // Ensure icon and text align
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
          </Button>
          <Button
            size="sm"
            className="flex items-center" // Ensure icon and text align
            onClick={handleAcceptClick}
            disabled={isOkButtonDisabled}
            aria-label="Accept suggested flashcard"
          >
            <Check className="mr-1 h-4 w-4" /> OK
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FlashcardSuggestionCard;

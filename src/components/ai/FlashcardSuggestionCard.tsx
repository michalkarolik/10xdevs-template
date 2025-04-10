import React from "react";
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
import { AlertTriangle, Check, Edit, RefreshCw } from "lucide-react"; // Icons
import type { FlashcardSuggestionViewModel } from "@/types";
// Placeholder for Edit Form - will be implemented later
// import FlashcardEditForm from './FlashcardEditForm';

interface FlashcardSuggestionCardProps {
  suggestion: FlashcardSuggestionViewModel;
  onAccept: (suggestionId: string) => void;
  onRegenerate: (suggestionId: string) => void;
  onEditToggle: (suggestionId: string) => void;
  onSaveEdit: (suggestionId: string, editedFront: string, editedBack: string) => void;
  onCancelEdit: (suggestionId: string) => void;
}

const FlashcardSuggestionCard: React.FC<FlashcardSuggestionCardProps> = ({
  suggestion,
  onAccept,
  onRegenerate,
  onEditToggle,
  onSaveEdit,
  onCancelEdit,
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


  const isOkButtonDisabled = suggestion.exceeds_limit && !suggestion.isEditing;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Flashcard</CardTitle>
        {suggestion.exceeds_limit && !suggestion.isEditing && (
           <Alert variant="destructive" className="mt-2">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Character Limit Exceeded</AlertTitle>
             <AlertDescription>
               The generated content exceeds the character limits. Please edit the card before accepting.
             </AlertDescription>
           </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestion.isEditing ? (
          // Placeholder for FlashcardEditForm
          <div>
            <p>Edit Form Placeholder for card {suggestion.id}</p>
            <p>Initial Front: {suggestion.front}</p>
            <p>Initial Back: {suggestion.back}</p>
            <Button onClick={() => handleSave("Edited Front Placeholder", "Edited Back Placeholder")} variant="secondary" size="sm">Save (Placeholder)</Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="ml-2">Cancel</Button>
          </div>
          // <FlashcardEditForm
          //   initialFront={suggestion.front}
          //   initialBack={suggestion.back}
          //   onSave={handleSave}
          //   onCancel={handleCancel}
          // />
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-sm mb-1">Front:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {suggestion.front}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Back:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {suggestion.back}
              </p>
            </div>
          </>
        )}
      </CardContent>
      {!suggestion.isEditing && (
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            aria-label="Edit suggested flashcard"
          >
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateClick}
            aria-label="Generate new version of suggested flashcard"
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
          </Button>
          <Button
            size="sm"
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

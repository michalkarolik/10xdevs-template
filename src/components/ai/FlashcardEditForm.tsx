import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FLASHCARD_LIMITS } from "@/types";
import { cn } from "@/lib/utils"; // Utility for conditional classes

interface FlashcardEditFormProps {
  initialFront: string;
  initialBack: string;
  onSave: (editedFront: string, editedBack: string) => void;
  onCancel: () => void;
}

const FlashcardEditForm: React.FC<FlashcardEditFormProps> = ({ initialFront, initialBack, onSave, onCancel }) => {
  const [editedFront, setEditedFront] = useState(initialFront);
  const [editedBack, setEditedBack] = useState(initialBack);

  // Use IDs for better accessibility linking labels and inputs
  const frontId = React.useId();
  const backId = React.useId();

  const frontLength = editedFront.length;
  const backLength = editedBack.length;

  const isFrontValid = frontLength > 0 && frontLength <= FLASHCARD_LIMITS.FRONT_MAX_LENGTH;
  const isBackValid = backLength > 0 && backLength <= FLASHCARD_LIMITS.BACK_MAX_LENGTH;
  const canSave = isFrontValid && isBackValid;

  const handleSaveClick = () => {
    if (canSave) {
      onSave(editedFront, editedBack);
    }
  };

  return (
    // Adjusted padding and spacing
    <div className="space-y-3 p-4 border rounded-md bg-muted/30 dark:bg-muted/10">
      <div className="space-y-1">
        {" "}
        {/* Group label, textarea, counter */}
        <label htmlFor={frontId} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Front
        </label>
        <Textarea
          id={frontId}
          value={editedFront}
          onChange={(e) => setEditedFront(e.target.value)}
          maxLength={FLASHCARD_LIMITS.FRONT_MAX_LENGTH + 20} // Allow slight overtyping before blocking
          className="min-h-[80px] shadow-sm" // Added shadow
          aria-describedby={`${frontId}-count`}
        />
        <p
          id={`${frontId}-count`}
          className={cn(
            "text-xs text-right mt-1",
            frontLength > FLASHCARD_LIMITS.FRONT_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {frontLength}/{FLASHCARD_LIMITS.FRONT_MAX_LENGTH}
        </p>
      </div>

      <div className="space-y-1">
        {" "}
        {/* Group label, textarea, counter */}
        <label htmlFor={backId} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Back
        </label>
        <Textarea
          id={backId}
          value={editedBack}
          onChange={(e) => setEditedBack(e.target.value)}
          maxLength={FLASHCARD_LIMITS.BACK_MAX_LENGTH + 50} // Allow slight overtyping
          className="min-h-[120px] shadow-sm" // Added shadow
          aria-describedby={`${backId}-count`}
        />
        <p
          id={`${backId}-count`}
          className={cn(
            "text-xs text-right mt-1",
            backLength > FLASHCARD_LIMITS.BACK_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {backLength}/{FLASHCARD_LIMITS.BACK_MAX_LENGTH}
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
        <Button onClick={handleSaveClick} disabled={!canSave} size="sm">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default FlashcardEditForm;

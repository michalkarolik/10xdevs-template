import React, { useState, useEffect } from "react";
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

const FlashcardEditForm: React.FC<FlashcardEditFormProps> = ({
  initialFront,
  initialBack,
  onSave,
  onCancel,
}) => {
  const [editedFront, setEditedFront] = useState(initialFront);
  const [editedBack, setEditedBack] = useState(initialBack);

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
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      <div>
        <label htmlFor="edit-front" className="block text-sm font-medium mb-1">
          Front
        </label>
        <Textarea
          id="edit-front"
          value={editedFront}
          onChange={(e) => setEditedFront(e.target.value)}
          maxLength={FLASHCARD_LIMITS.FRONT_MAX_LENGTH + 20} // Allow slight overtyping before blocking
          className="min-h-[80px]"
          aria-describedby="front-char-count"
        />
        <p
          id="front-char-count"
          className={cn(
            "text-xs text-right mt-1",
            frontLength > FLASHCARD_LIMITS.FRONT_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {frontLength}/{FLASHCARD_LIMITS.FRONT_MAX_LENGTH}
        </p>
      </div>

      <div>
        <label htmlFor="edit-back" className="block text-sm font-medium mb-1">
          Back
        </label>
        <Textarea
          id="edit-back"
          value={editedBack}
          onChange={(e) => setEditedBack(e.target.value)}
          maxLength={FLASHCARD_LIMITS.BACK_MAX_LENGTH + 50} // Allow slight overtyping
          className="min-h-[120px]"
          aria-describedby="back-char-count"
        />
        <p
          id="back-char-count"
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

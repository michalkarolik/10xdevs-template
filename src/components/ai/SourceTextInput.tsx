import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Icon for loading state

interface SourceTextInputProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onGenerateClick: () => void;
  isLoading: boolean;
}

const SourceTextInput: React.FC<SourceTextInputProps> = ({
  sourceText,
  onSourceTextChange,
  onGenerateClick,
  isLoading,
}) => {
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSourceTextChange(event.target.value);
  };

  const isButtonDisabled = isLoading || sourceText.trim() === "";

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your text here to generate flashcards..."
        value={sourceText}
        onChange={handleTextChange}
        className="min-h-[150px] resize-y" // Allow vertical resize
        aria-label="Source text for flashcard generation"
        disabled={isLoading}
      />
      <Button
        onClick={onGenerateClick}
        disabled={isButtonDisabled}
        className="w-full sm:w-auto" // Full width on small screens
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Flashcards"
        )}
      </Button>
    </div>
  );
};

export default SourceTextInput;

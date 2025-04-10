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

  // Unique ID for associating label and textarea
  const textareaId = React.useId();

  const isButtonDisabled = isLoading || sourceText.trim() === "";

  return (
    <div className="space-y-3"> {/* Reduced space inside this component */}
       {/* Added label for accessibility */}
      <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Source Text
      </label>
      <Textarea
        id={textareaId}
        placeholder="Paste your text here to generate flashcards..."
        value={sourceText}
        onChange={handleTextChange}
        className="min-h-[150px] resize-y shadow-sm" // Added shadow
        aria-label="Source text for flashcard generation" // Keep aria-label as well
        disabled={isLoading}
      />
      <div className="flex justify-end"> {/* Align button to the right */}
        <Button
          onClick={onGenerateClick}
          disabled={isButtonDisabled}
          className="w-full sm:w-auto" // Full width on small screens, auto on larger
        >
          {isLoading ? (
            <>
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

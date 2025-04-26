import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "lucide-react";

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
  return (
    <Card className="bg-background border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Generate Flashcards</CardTitle>
        <CardDescription>Describe the topic or paste text from which to generate flashcards</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter a description of what you want to study, paste text from an article, book, or lecture notes. For example: 'Generate flashcards about Spanish cuisine' or 'Create questions about basic astronomy concepts'."
          className="min-h-[120px]"
          value={sourceText}
          onChange={(e) => onSourceTextChange(e.target.value)}
          disabled={isLoading}
          data-test-id="ai-generation-prompt"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={onGenerateClick}
          disabled={isLoading || !sourceText.trim()}
          className="w-full sm:w-auto"
          data-test-id="generate-ai-flashcards-button"
        >
          <Bot className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Generate Flashcards"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SourceTextInput;

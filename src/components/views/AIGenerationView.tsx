import React from "react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import SourceTextInput from '@/components/ai/SourceTextInput';
import GeneratedFlashcardsDisplay from '@/components/ai/GeneratedFlashcardsDisplay';

interface AIGenerationViewProps {
  topicId: string;
}

const AIGenerationView: React.FC<AIGenerationViewProps> = ({ topicId }) => {
  const {
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
    acceptedCount,
    lastAcceptedId,
  } = useAIGeneration(topicId);

  return (
    <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto" data-test-id="ai-generation-container">
      {acceptedCount > 0 && (
        <div className="text-center text-green-600 dark:text-green-400 font-medium" data-test-id="accepted-flashcards-count">
          Accepted Flashcards: {acceptedCount}
        </div>
      )}

      <SourceTextInput
        sourceText={sourceText}
        onSourceTextChange={setSourceText}
        onGenerateClick={handleGenerate}
        isLoading={isLoading}
        data-test-id="ai-generation-source-input"
      />

      <GeneratedFlashcardsDisplay
        suggestions={suggestions}
        isLoading={isLoading && suggestions.length === 0}
        error={error}
        onAccept={handleAccept}
        onRegenerate={handleRegenerate}
        onEditToggle={handleEditToggle}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        lastAcceptedId={lastAcceptedId}
        data-test-id="generated-flashcards-display"
      />
    </div>
  );
};

export default AIGenerationView;

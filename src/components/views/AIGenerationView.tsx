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
    acceptedCount, // Get accepted count
    lastAcceptedId, // Get last accepted ID
  } = useAIGeneration(topicId);

  return (
    // Adjusted spacing, added max-width and centering for the main content block
    <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
      {/* Display Accepted Count */}
      {acceptedCount > 0 && (
        <div className="text-center text-green-600 dark:text-green-400 font-medium">
          Accepted Flashcards: {acceptedCount}
        </div>
      )}

      <SourceTextInput
        sourceText={sourceText}
        onSourceTextChange={setSourceText}
        onGenerateClick={handleGenerate}
        isLoading={isLoading} // Pass the general loading state for the button
      />

      <GeneratedFlashcardsDisplay
        suggestions={suggestions}
        // Pass a more specific loading state if available, otherwise use general isLoading
        // For now, using the main isLoading for the display loader as well
        isLoading={isLoading && suggestions.length === 0} // Show loader only initially or when regenerating all
        error={error}
        onAccept={handleAccept}
        onRegenerate={handleRegenerate}
        onEditToggle={handleEditToggle}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        lastAcceptedId={lastAcceptedId} // Pass last accepted ID down
      />
    </div>
  );
};

export default AIGenerationView;

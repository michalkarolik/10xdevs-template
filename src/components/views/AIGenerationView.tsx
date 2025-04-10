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
  } = useAIGeneration(topicId);

  return (
    <div className="space-y-8"> {/* Increased spacing */}
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
      />
    </div>
  );
};

export default AIGenerationView;

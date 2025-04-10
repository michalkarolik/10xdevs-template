import React from "react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
// Placeholder imports - replace with actual components later
// import SourceTextInput from '@/components/ai/SourceTextInput';
// import GeneratedFlashcardsDisplay from '@/components/ai/GeneratedFlashcardsDisplay';

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
    <div className="space-y-6">
      {/* Placeholder for SourceTextInput */}
      <div>
        <p>Source Text Input Area (Placeholder)</p>
        {/* <SourceTextInput
          sourceText={sourceText}
          onSourceTextChange={setSourceText}
          onGenerateClick={handleGenerate}
          isLoading={isLoading} // Or a more specific loading state
        /> */}
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste your text here to generate flashcards..."
          className="w-full h-40 p-2 border rounded" // Basic styling
        />
        <button onClick={handleGenerate} disabled={isLoading || !sourceText}>
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Placeholder for GeneratedFlashcardsDisplay */}
      <div>
        <p>Generated Flashcards Display Area (Placeholder)</p>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {/* <GeneratedFlashcardsDisplay
          suggestions={suggestions}
          isLoading={isLoading} // Or a more specific loading state
          error={error}
          onAccept={handleAccept}
          onRegenerate={handleRegenerate}
          onEditToggle={handleEditToggle}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
        /> */}
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <p>ID: {suggestion.id}</p>
            <p>Front: {suggestion.front}</p>
            <p>Back: {suggestion.back}</p>
            <p>Exceeds Limit: {suggestion.exceeds_limit ? "Yes" : "No"}</p>
            <p>Editing: {suggestion.isEditing ? "Yes" : "No"}</p>
            {/* Add buttons later */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIGenerationView;

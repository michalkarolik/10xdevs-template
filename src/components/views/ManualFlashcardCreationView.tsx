import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { processFlashcardAccept } from '@/pages/api/topics/[topic_id]/accept';
import { supabaseClient } from '@/db/supabase.client';

interface ManualFlashcardCreationViewProps {
  topicId: string;
}

export default function ManualFlashcardCreationView({ topicId }: ManualFlashcardCreationViewProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      toast.error('Both question and answer are required');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting flashcard:', { topicId, question, answer });
    
    try {
      // Use processFlashcardAccept instead of direct API call
      const result = await processFlashcardAccept(
        topicId, 
        question, 
        answer, 
        'manual', 
        supabaseClient
      );
      
      console.log('Response:', result);
      
      if (!result) {
        throw new Error('Failed to create flashcard');
      }
      
      toast.success('Flashcard created successfully!');
      
      // Redirect to the topics page after successful creation
      window.location.href = `/topics/${topicId}`;
      
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error(`Failed to create flashcard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Manually Create Flashcards</h1>
        <p className="text-muted-foreground">
          Create flashcards by filling out the form below.
        </p>
      </div>
      
      <Card className="w-full">
        <form onSubmit={handleSubmit} data-test-id="add-flashcard-form">
          <CardHeader>
            <CardTitle>New Flashcard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="question" className="block text-sm font-medium">
                Question (Front)
              </label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the question for the flashcard"
                data-test-id="flashcard-question-input"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="answer" className="block text-sm font-medium">
                Answer (Back)
              </label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer for the flashcard"
                data-test-id="flashcard-answer-input"
                className="min-h-[150px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => window.location.href = `/topics/${topicId}`}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !question.trim() || !answer.trim()}
              data-test-id="create-flashcard-button"
            >
              {isSubmitting ? 'Creating...' : 'Create Flashcard'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

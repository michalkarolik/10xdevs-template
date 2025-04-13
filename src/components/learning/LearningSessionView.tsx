import React, { useEffect, useState } from 'react';
import { useLearningSession, SessionState } from '@/hooks/useLearningSession';
import type { TopicSummaryDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, XCircle, HelpCircle } from 'lucide-react'; // Icons
import { createLearningSession, saveFlashcardResponse } from '@/lib/api'; // Import API functions

interface LearningSessionViewProps {
  initialTopics: TopicSummaryDto[];
}

const LearningSessionView: React.FC<LearningSessionViewProps> = ({ initialTopics }) => {
    const [userFlashcards, setFlashcards] = useState([]);
    const [userResponses, setUserResponses] = useState({});
  const {
    topics,
    selectedTopicId,
    selectedTopicName,
    flashcards, // Add flashcards to destructuring
    currentCard,
    currentCardIndex,
    sessionState,
    error,
    startSession,
    showAnswer,
    rateCard,
    resetSession,
  } = useLearningSession(initialTopics);

  console.log('[LearningSessionView] Rendering with state:', sessionState, 'Selected Topic ID:', selectedTopicId, 'Current Card:', currentCard); // Add logging

  const { topicId } = useParams(); // Get topic ID from URL

  useEffect(() => {
      // Fetch flashcards based on the selected topic
      const fetchFlashcards = async () => {
          const response = await fetch(`/api/flashcards?topicId=${topicId}`);
          const data = await response.json();
          setUserFlashcards(data);
      };

      fetchFlashcards();
  }, [topicId]); // Remove this line
  }, [topicId]); // This line should be kept

  const handleResponse = async (flashcardId, response) => {
      // Save user response
      setUserResponses((prev) => ({ ...prev, [flashcardId]: response }));

      // Save response to the database
      await saveFlashcardResponse(flashcardId, response);
  };

  const handleSessionEnd = async () => {
      // Create a new learning session
      const sessionId = await createLearningSession();

      // Save all user responses
      for (const [flashcardId, response] of Object.entries(userResponses)) {
          await saveFlashcardResponse(sessionId, flashcardId, response);
      }
  };
    useEffect(() => {
      startSession(topicId);
    }, [topicId]);
  }, [topicId]);

  // Topic Selection View
  if (sessionState === SessionState.SELECTING_TOPIC) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
        <h2 className="text-xl font-semibold">Select a Topic to Start</h2>
        <Select onValueChange={handleTopicChange} value={selectedTopicId ?? ""}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a topic..." />
          </SelectTrigger>
          <SelectContent>
            {topics.length > 0 ? (
              topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name} ({topic.flashcard_count ?? 0} cards)
                </SelectItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No topics found.</div>
            )}
          </SelectContent>
        </Select>
        {/* Button is implicitly handled by Select's onValueChange */}
      </div>
    );
  }

  // Loading View
  if (sessionState === SessionState.LOADING_FLASHCARDS) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading flashcards for {selectedTopicName}...</span>
      </div>
    );
  }

  // Error View
  if (sessionState === SessionState.ERROR) {
    return (
      <Card className="max-w-lg mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "An unknown error occurred."}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={resetSession}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Finished View
  if (sessionState === SessionState.FINISHED) {
    return (
      <Card className="max-w-lg mx-auto border-green-500">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" /> Session Complete!
          </CardTitle>
          <CardDescription>You have reviewed all cards for {selectedTopicName}.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleSessionEnd}>
            <RotateCcw className="mr-2 h-4 w-4" /> Start New Session
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Flashcard Display View (SHOWING_FRONT or SHOWING_BACK)
  if (currentCard && (sessionState === SessionState.SHOWING_FRONT || sessionState === SessionState.SHOWING_BACK)) {
    const totalCards = userFlashcards.length;
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{selectedTopicName}</CardTitle>
          <CardDescription>
            Card {currentCardIndex + 1} of {totalCards}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 min-h-[200px] flex flex-col justify-center">
          {/* Front */}
          <div className="p-4 border rounded-md bg-muted/20">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Front</h3>
            <p className="text-lg whitespace-pre-wrap break-words">{currentCard.front}</p>
          </div>

          {/* Back (conditionally rendered) */}
          {sessionState === SessionState.SHOWING_BACK && (
            <div className="p-4 border rounded-md bg-muted/20 animate-in fade-in duration-300">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Back</h3>
              <p className="text-lg whitespace-pre-wrap break-words">{currentCard.back}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          {sessionState === SessionState.SHOWING_FRONT && (
            <Button onClick={showAnswer} size="lg" className="w-full">
              Show Answer
            </Button>
          )}
          {sessionState === SessionState.SHOWING_BACK && (
            <div className="w-full space-y-3">
               <p className="text-center text-sm text-muted-foreground">How well did you know this?</p>
               <div className="grid grid-cols-3 gap-2">
                 {/* Bad */}
                 <Button
                   variant="destructive"
                   className="bg-red-500 hover:bg-red-600 text-white"
                   onClick={() => rateCard('bad')}
                 >
                   <XCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Again</span><span className="sm:hidden">1</span>
                 </Button>
                 {/* Medium */}
                 <Button
                   variant="outline"
                   className="border-yellow-500 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                   onClick={() => rateCard('medium')}
                 >
                   <HelpCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Hard</span><span className="sm:hidden">2</span>
                 </Button>
                 {/* Good */}
                 <Button
                   variant="default"
                   className="bg-green-600 hover:bg-green-700 text-white"
                   onClick={() => rateCard('good')}
                 >
                   <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Easy</span><span className="sm:hidden">3</span>
                 </Button>
               </div>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Fallback if no state matches (should not happen)
  return <div>Something went wrong.</div>;
};

export default LearningSessionView;

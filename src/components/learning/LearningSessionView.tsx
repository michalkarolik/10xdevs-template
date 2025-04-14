import React, { useEffect, useState } from 'react';
import { useLearningSession, SessionState } from '@/hooks/useLearningSession';
import type { TopicSummaryDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, XCircle, HelpCircle } from 'lucide-react'; // Icons
import { createLearningSession, saveFlashcardResponse } from '@/lib/api'; // Import API functions
import { useParams } from 'react-router-dom'; // Correctly import useParams

interface LearningSessionViewProps {
  initialTopics: TopicSummaryDto[];
}

const LearningSessionView: React.FC<LearningSessionViewProps> = ({ initialTopics }) => {
    const [userFlashcards, setFlashcards] = useState([]);
    const [userResponses, setUserResponses] = useState<Record<string, string>>({}); // Added type annotation
    const { topicId } = useParams<{ topicId: string }>(); // Get topic ID from URL and type it

    const {
        topics,
        selectedTopicId,
        selectedTopicName,
        // flashcards, // This comes from the hook, might conflict with userFlashcards state
        currentCard,
        currentCardIndex,
        sessionState,
        error,
        startSession,
        showAnswer,
        rateCard,
        resetSession,
        handleTopicChange, // Assuming this comes from the hook or needs to be defined
    } = useLearningSession(initialTopics);

    console.log('[LearningSessionView] Rendering with state:', sessionState, 'Selected Topic ID:', selectedTopicId, 'Current Card:', currentCard); // Add logging


    // Effect to fetch flashcards when topicId changes (if needed independently of the hook)
    // Consider if this logic should be inside the useLearningSession hook instead
    useEffect(() => {
        if (topicId) { // Only fetch if topicId is available
            const fetchFlashcards = async () => {
                try {
                    // TODO: Update the API endpoint if necessary
                    const response = await fetch(`/api/topics/${topicId}/flashcards`); // Example: More RESTful endpoint
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    // Assuming the API returns an array of flashcards
                    setFlashcards(data.flashcards || []); // Adjust based on actual API response structure
                } catch (fetchError) {
                    console.error("Failed to fetch flashcards:", fetchError);
                    // Handle error state if needed
                }
            };
            fetchFlashcards();
        }
    }, [topicId]);

    // Effect to start the session when topicId changes
    useEffect(() => {
        if (topicId) { // Ensure topicId is present before starting
            startSession(topicId);
        }
    }, [topicId, startSession]); // Add startSession to dependency array

    const handleResponse = async (flashcardId: string, response: string) => {
        // Save user response locally
        setUserResponses((prev) => ({ ...prev, [flashcardId]: response }));

        // TODO: Decide if saving individual responses immediately is needed,
        // or only at the end of the session.
        // await saveFlashcardResponse(flashcardId, response); // This API function might need sessionId
    };

    const handleSessionEnd = async () => {
        console.log("Ending session, saving responses:", userResponses);
        try {
            // TODO: Ensure createLearningSession API exists and works as expected
            // const sessionResult = await createLearningSession({ topicId: selectedTopicId, responses: userResponses }); // Example: Pass data needed
            // console.log("Learning session created/updated:", sessionResult);

            // Example: If saving happens individually per card response, this might just reset the state
            setUserResponses({}); // Clear responses for the next session
            resetSession(); // Reset the learning session hook state

        } catch (endSessionError) {
            console.error("Failed to save session data:", endSessionError);
            // Handle error state, maybe show a toast notification
        }
    };


    // Topic Selection View (Only if no topicId is provided by URL/props initially)
    // This might be handled by a different component/route if topicId is always expected
    if (!topicId && sessionState === SessionState.SELECTING_TOPIC) {
        return (
            <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
                <h2 className="text-xl font-semibold">Select a Topic to Start</h2>
                <Select onValueChange={handleTopicChange} value={selectedTopicId ?? ""} className="w-full">
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
                {/* Button might be needed if selection doesn't automatically navigate/start */}
            </div>
        );
    }

    // Loading View
    if (sessionState === SessionState.LOADING_FLASHCARDS) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading flashcards for {selectedTopicName || 'selected topic'}...</span>
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
                    <p>{error || "An unknown error occurred while loading the session."}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={resetSession}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Try Again or Select Topic
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
                    <CardDescription>You have reviewed all cards for {selectedTopicName || 'this topic'}.</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={resetSession}> {/* Changed to resetSession which likely goes back to topic selection */}
                        Select New Topic
                    </Button>
                    {/* Optional: Add a button to review the same topic again */}
                    {/* <Button onClick={() => startSession(selectedTopicId)}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Review Again
                    </Button> */}
                     <Button onClick={handleSessionEnd}> {/* Keep if explicit save action is needed */}
                       End Session & Save
                     </Button>
                </CardFooter>
            </Card>
        );
    }

    // Flashcard Display View (SHOWING_FRONT or SHOWING_BACK)
    if (currentCard && (sessionState === SessionState.SHOWING_FRONT || sessionState === SessionState.SHOWING_BACK)) {
        // Use flashcards from the hook if available, otherwise fallback or show loading/error
        const totalCards = useLearningSession.length; // Get total from the hook's flashcards
        const cardPosition = currentCardIndex + 1;

        return (
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>{selectedTopicName || 'Learning Session'}</CardTitle>
                    <CardDescription>
                        Card {cardPosition} of {totalCards}
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

    // Fallback if no state matches or topicId is missing but session isn't SELECTING_TOPIC
    // This might indicate an issue with routing or state management
    if (topicId && sessionState === SessionState.SELECTING_TOPIC) {
      // If we have a topicId but are stuck in SELECTING_TOPIC, it might be loading or an initial state issue
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Initializing session...</span>
        </div>
      );
    }


    // General fallback
    return (
        <div className="text-center py-10">
            <p>Something went wrong or the session state is unexpected.</p>
            <Button variant="outline" onClick={resetSession} className="mt-4">
                <RotateCcw className="mr-2 h-4 w-4" /> Go back to Topic Selection
            </Button>
        </div>
    );
};

export default LearningSessionView;

import React, { useEffect, useState, useCallback } from "react";
import { useLearningSession, SessionState } from '@/hooks/useLearningSession';
import type { TopicSummaryDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, XCircle, HelpCircle } from 'lucide-react'; // Icons
import { createLearningSession, saveFlashcardResponse } from '@/lib/api/learning-sessions'; // Import API functions
import { useParams, useNavigate } from 'react-router-dom'; // Correct named import
import { toast } from "sonner"; // Import toast for notifications

interface LearningSessionViewProps {
  initialTopics: TopicSummaryDto[];
}

const LearningSessionView: React.FC<LearningSessionViewProps> = ({ initialTopics }) => {
    const [userFlashcards, setFlashcards] = useState([]);
    const [userResponses, setUserResponses] = useState<Record<string, string>>({}); // Added type annotation
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [topicId, setTopicId] = useState<string | null>(null); // State to hold topicId
    const navigate = useNavigate();

    // Get topic ID from URL and type it
    const { topicId: topicIdFromParams } = useParams<{ topicId: string }>();

    // Always call hooks at the top level, never conditionally
    const {
        topics,
        selectedTopicId,
        selectedTopicName,
        currentCard,
        currentCardIndex,
        sessionState,
        error,
        startSession,
        showAnswer,
        rateCard,
        resetSession,
    } = useLearningSession(initialTopics);

    // State to track if the component has mounted - moved after the hook call
    const [hasMounted, setHasMounted] = useState(false);

    // Effect to set hasMounted to true after the component mounts
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Effect to get topicId from params only once
    useEffect(() => {
        if (topicIdFromParams) {
            setTopicId(topicIdFromParams);
            console.log("Topic ID from params:", topicIdFromParams);
        }
    }, [topicIdFromParams]);

    // Define handleTopicChange function
    const handleTopicChange = (topicId: string) => {
        if (topicId) {
            // Update the URL to reflect the selected topic
            navigate(`/learning-session/${topicId}`);
            startSession(topicId);
        }
    };

    console.log('[LearningSessionView] Rendering with state:', sessionState, 'Selected Topic ID:', selectedTopicId, 'Current Card:', currentCard); // Add logging

    // Effect to fetch flashcards when topicId changes
    useEffect(() => {
        if (topicId && hasMounted) { // Only fetch if topicId is available AND component has mounted
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
    }, [topicId, hasMounted]);

    // Effect to start the session when topicId changes
    useEffect(() => {
        console.log("useEffect - topicId:", topicId, "hasMounted:", hasMounted);
        if (topicId && hasMounted) { // Ensure topicId is present before starting AND component has mounted
            console.log("Attempting to initialize session with topicId:", topicId, "and hasMounted:", hasMounted);
            // Create a learning session in the database
            const initSession = async () => {
                try {
                    console.log("Creating learning session for topic:", topicId);
                    const session = await createLearningSession(topicId);
                    console.log("createLearningSession response:", session); // Log the response

                    if (session && session.session_id) {
                        console.log("Setting sessionId:", session.session_id);
                        setSessionId(session.session_id);
                        console.log("Session ID set:", session.session_id);
                        startSession(topicId);
                    } else {
                        console.error("Session ID is missing in the response:", session);
                        toast.error("Failed to start learning session: Session ID missing");
                    }
                } catch (error) {
                    console.error("Failed to create learning session:", error);
                    toast.error("Failed to start learning session");
                }
            };
            
            initSession();
        } else {
            console.log("Not initializing session: topicId is", topicId, "and hasMounted is", hasMounted);
        }
    }, [topicId, startSession, hasMounted, sessionId]); // Add sessionId to dependency array

    const handleResponse = async (flashcardId: string, response: string) => {
        // Map the response to the expected format
        const mappedResponse = response === 'bad' ? 'Again' : 
                              response === 'medium' ? 'Hard' : 
                              response === 'good' ? 'Easy' : 'Again';
        
        // Save user response locally
        setUserResponses((prev) => ({ ...prev, [flashcardId]: mappedResponse }));

        // Save response to database if we have a session ID
        if (sessionId && flashcardId) {
            console.log("Session ID inside handleResponse:", sessionId); // Add logging
            try {
                console.log(`Saving response "${mappedResponse}" for card ${flashcardId} in session ${sessionId}`);
                const result = await saveFlashcardResponse(
                    sessionId,
                    flashcardId,
                    mappedResponse as 'Again' | 'Hard' | 'Easy'
                );
                console.log(`Successfully saved response:`, result);
            } catch (error) {
                console.error("Failed to save flashcard response:", error);
                toast.error("Failed to save your response");
            }
        } else {
            console.warn("Cannot save response - missing sessionId or flashcardId", { sessionId, flashcardId });
        }
    };

    const handleSessionEnd = async () => {
        console.log("Ending session, responses saved individually");
        try {
            // Since we're saving responses individually, we just need to reset state
            setUserResponses({}); // Clear responses for the next session
            setSessionId(null); // Clear session ID
            resetSession(); // Reset the learning session hook state
            toast.success("Learning session completed!");
        } catch (endSessionError) {
            console.error("Failed to end session:", endSessionError);
            toast.error("Failed to complete session");
        }
    };

    // If there's no topicId in the URL, show the topic selection view
    if (!topicId) {
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
                    <Button variant="outline" onClick={resetSession}>
                        Select New Topic
                    </Button>
                     <Button onClick={handleSessionEnd}>
                       End Session & Save
                     </Button>
                </CardFooter>
            </Card>
        );
    }

    // Conditional rendering: only render flashcard display if sessionId is available
    if (!sessionId) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Initializing session...</span>
            </div>
        );
    }

    // Flashcard Display View (SHOWING_FRONT or SHOWING_BACK)
    if (currentCard && (sessionState === SessionState.SHOWING_FRONT || sessionState === SessionState.SHOWING_BACK)) {
        const totalCards = userFlashcards.length || 0; // Use userFlashcards instead of accessing the hook directly
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
                                    onClick={() => {
                                        if (currentCard) {
                                            // Log before calling handleResponse
                                            console.log("handleResponse called with sessionId:", sessionId, "flashcardId:", currentCard.id);
                                            // Najpierw zapisz odpowiedź, a potem przejdź do następnej karty
                                            handleResponse(currentCard.id, 'bad')
                                                .then(() => rateCard('bad'))
                                                .catch(err => {
                                                    console.error("Error handling 'Again' response:", err);
                                                    // Kontynuuj mimo błędu zapisu
                                                    rateCard('bad');
                                                });
                                        }
                                    }}
                                >
                                    <XCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Again</span><span className="sm:hidden">1</span>
                                </Button>
                                {/* Medium */}
                                <Button
                                    variant="outline"
                                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                                    onClick={() => {
                                        if (currentCard) {
                                            // Log before calling handleResponse
                                            console.log("handleResponse called with sessionId:", sessionId, "flashcardId:", currentCard.id);
                                            // Najpierw zapisz odpowiedź, a potem przejdź do następnej karty
                                            handleResponse(currentCard.id, 'medium')
                                                .then(() => rateCard('medium'))
                                                .catch(err => {
                                                    console.error("Error handling 'Hard' response:", err);
                                                    // Kontynuuj mimo błędu zapisu
                                                    rateCard('medium');
                                                });
                                        }
                                    }}
                                >
                                    <HelpCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Hard</span><span className="sm:hidden">2</span>
                                </Button>
                                {/* Good */}
                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        if (currentCard) {
                                            // Log before calling handleResponse
                                            console.log("handleResponse called with sessionId:", sessionId, "flashcardId:", currentCard.id);
                                            // Najpierw zapisz odpowiedź, a potem przejdź do następnej karty
                                            handleResponse(currentCard.id, 'good')
                                                .then(() => rateCard('good'))
                                                .catch(err => {
                                                    console.error("Error handling 'Easy' response:", err);
                                                    // Kontynuuj mimo błędu zapisu
                                                    rateCard('good');
                                                });
                                        }
                                    }}
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

    // Fallback
    return (
        <div className="text-center py-10">
            <p>Something went wrong or the session state is unexpected.</p>
            <Button variant="outline" onClick={resetSession} className="mt-4">
                Go back to Topic Selection
            </Button>
        </div>
    );
};

export default LearningSessionView;

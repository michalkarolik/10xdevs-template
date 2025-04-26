import React from "react";
import { SessionState, useLearningSession } from "@/hooks/useLearningSession";
import type { TopicSummaryDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, HelpCircle, Loader2, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { saveFlashcardResponse } from "@/lib/api/learning-sessions";

interface LearningSessionViewProps {
  topics: TopicSummaryDto[];
  navigate: (topicId: string) => void;
}

const LearningSessionView: React.FC<LearningSessionViewProps> = ({ topics = [], navigate }) => {
  console.log("LearningSessionView mounted, topics:", topics);

  const {
    selectedTopicId,
    selectedTopicName,
    flashcards = [],
    currentCard,
    currentCardIndex,
    sessionState,
    error,
    startSession,
    showAnswer,
    rateCard,
    resetSession,
    sessionId,
  } = useLearningSession(topics);

  const handleTopicChange = (topicId: string) => {
    console.log("Topic selected:", topicId);
    if (topicId) {
      startSession(topicId);
      navigate(topicId);
    }
  };

  const handleResponse = async (flashcardId: string, response: string) => {
    // Map the response to the expected format
    const mappedResponse =
      response === "bad" ? "Again" : response === "medium" ? "Hard" : response === "good" ? "Easy" : "Again";

    // Save response to database if we have a session ID
    if (sessionId && flashcardId) {
      try {
        await saveFlashcardResponse(sessionId, flashcardId, mappedResponse as "Again" | "Hard" | "Easy");
      } catch (error) {
        console.error("Failed to save flashcard response:", error);
        toast.error("Failed to save your response");
      }
    }
  };

  const handleSessionEnd = async () => {
    try {
      resetSession(); // Reset the learning session hook state
      toast.success("Learning session completed!");
    } catch (endSessionError) {
      console.error("Failed to save session:", endSessionError);
      toast.error("Failed to complete session");
    }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">Select a Topic to Start</h2>

      <div className="w-full">
        {/* Debug info */}
        <div className="mb-2 text-sm text-gray-500">Available topics: {topics.length}</div>

        <Select onValueChange={handleTopicChange} value={selectedTopicId ?? ""}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a topic..." />
          </SelectTrigger>
          <SelectContent>
            {topics && topics.length > 0 ? (
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

      {/* Loading View */}
      {sessionState === SessionState.LOADING_FLASHCARDS && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading flashcards for {selectedTopicName || "selected topic"}...</span>
        </div>
      )}

      {/* Error View */}
      {sessionState === SessionState.ERROR && (
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
      )}

      {/* Finished View */}
      {sessionState === SessionState.FINISHED && (
        <Card className="max-w-lg mx-auto border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" /> Session Complete!
            </CardTitle>
            <CardDescription>You have reviewed all cards for {selectedTopicName || "this topic"}.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetSession}>
              Select New Topic
            </Button>
            <Button onClick={handleSessionEnd}>End Session & Save</Button>
          </CardFooter>
        </Card>
      )}

      {/* Conditional rendering: only render flashcard display if sessionId is available */}
      {sessionState !== SessionState.LOADING_FLASHCARDS &&
        sessionState !== SessionState.ERROR &&
        sessionState !== SessionState.FINISHED &&
        !selectedTopicId && (
          <div className="flex justify-center items-center py-10">
            <p>Select a topic to start learning.</p>
          </div>
        )}

      {/* Flashcard Display View (SHOWING_FRONT or SHOWING_BACK) */}
      {currentCard && (sessionState === SessionState.SHOWING_FRONT || sessionState === SessionState.SHOWING_BACK) && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>{selectedTopicName || "Learning Session"}</CardTitle>
            <CardDescription>
              Card {currentCardIndex + 1} of {flashcards?.length || 0}
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
                        handleResponse(currentCard.id, "bad")
                          .then(() => rateCard("bad"))
                          .catch((err) => {
                            console.error("Error handling 'Again' response:", err);
                            rateCard("bad");
                          });
                      }
                    }}
                  >
                    <XCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Again</span>
                    <span className="sm:hidden">1</span>
                  </Button>
                  {/* Medium */}
                  <Button
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                    onClick={() => {
                      if (currentCard) {
                        handleResponse(currentCard.id, "medium")
                          .then(() => rateCard("medium"))
                          .catch((err) => {
                            console.error("Error handling 'Hard' response:", err);
                            rateCard("medium");
                          });
                      }
                    }}
                  >
                    <HelpCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Hard</span>
                    <span className="sm:hidden">2</span>
                  </Button>
                  {/* Good */}
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      if (currentCard) {
                        handleResponse(currentCard.id, "good")
                          .then(() => rateCard("good"))
                          .catch((err) => {
                            console.error("Error handling 'Easy' response:", err);
                            rateCard("good");
                          });
                      }
                    }}
                  >
                    <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Easy</span>
                    <span className="sm:hidden">3</span>
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Fallback */}
      {!(
        sessionState === SessionState.LOADING_FLASHCARDS ||
        sessionState === SessionState.ERROR ||
        sessionState === SessionState.FINISHED
      ) &&
        !currentCard &&
        selectedTopicId && (
          <div className="text-center py-10">
            <p>Something went wrong or the session state is unexpected.</p>
            <Button variant="outline" onClick={resetSession} className="mt-4">
              Go back to Topic Selection
            </Button>
          </div>
        )}
    </div>
  );
};

export default LearningSessionView;

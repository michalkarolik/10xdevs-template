import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Import toast for notifications
import type { TopicCreateDto, TopicResponseDto, ErrorResponse } from "@/types";

interface AddTopicDialogProps {
  onTopicAdded?: (newTopic: TopicResponseDto) => void; // Optional callback after success
  children: React.ReactNode; // To wrap the trigger button
}

export const AddTopicDialog: React.FC<AddTopicDialogProps> = ({ onTopicAdded, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTopic = useCallback(async () => {
    if (!topicName.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const requestBody: TopicCreateDto = { name: topicName.trim() };
      const response = await fetch(`/api/topics`, {
        method: 'POST',
        credentials: 'include'
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create topic.";
        try {
          const errorData: ErrorResponse | { message?: string } = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) { /* Ignore parsing error */ }
        throw new Error(errorMessage);
      }

      const newTopic: TopicResponseDto = await response.json();
      toast.success(`Topic "${newTopic.name}" created successfully!`); // Success notification
      setTopicName(""); // Clear input
      setIsOpen(false); // Close dialog
      onTopicAdded?.(newTopic); // Call optional callback

    } catch (err) {
      console.error("Error creating topic:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message); // Show error inside dialog
      toast.error(`Error: ${message}`); // Error notification
    } finally {
      setIsLoading(false);
    }
  }, [topicName, isLoading, onTopicAdded]);

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTopicName("");
      setError(null);
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || topicName.trim().length === 0 || topicName.trim().length > 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
          <DialogDescription>
            Enter a name for your new topic. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic-name" className="text-right">
              Name
            </Label>
            <Input
              id="topic-name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="col-span-3"
              maxLength={100}
              disabled={isLoading}
              aria-describedby="name-error"
            />
          </div>
           {/* Display length counter */}
           <p className="col-start-2 col-span-3 text-xs text-muted-foreground text-right pr-1">
             {topicName.length}/100
           </p>
           {/* Display error message */}
           {error && (
             <p id="name-error" className="col-start-2 col-span-3 text-sm text-destructive">
               {error}
             </p>
           )}
        </div>
        <DialogFooter>
           {/* Add explicit Close button */}
          <DialogClose asChild>
             <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleAddTopic} disabled={isSubmitDisabled}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

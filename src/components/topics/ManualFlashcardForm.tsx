import React, { useState, useId } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FLASHCARD_LIMITS } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Assuming you use sonner for notifications

interface ManualFlashcardFormProps {
  topicId: string;
  onFlashcardAdded?: () => void; // Optional callback after adding
  // onFinish prop removed
}

const formSchema = z.object({
  front: z.string()
    .min(1, "Front text is required")
    .max(FLASHCARD_LIMITS.FRONT_MAX_LENGTH, `Front text cannot exceed ${FLASHCARD_LIMITS.FRONT_MAX_LENGTH} characters`),
  back: z.string()
    .min(1, "Back text is required")
    .max(FLASHCARD_LIMITS.BACK_MAX_LENGTH, `Back text cannot exceed ${FLASHCARD_LIMITS.BACK_MAX_LENGTH} characters`),
});

type FormData = z.infer<typeof formSchema>;

export const ManualFlashcardForm: React.FC<ManualFlashcardFormProps> = ({ topicId, onFlashcardAdded }) => { // Removed onFinish from destructuring
  const [isSubmitting, setIsSubmitting] = useState(false);
  const frontId = useId();
  const backId = useId();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      front: '',
      back: '',
    },
  });

  const frontValue = form.watch('front');
  const backValue = form.watch('back');
  const frontLength = frontValue?.length || 0;
  const backLength = backValue?.length || 0;

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/topics/${topicId}/flashcards/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add flashcard' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const newFlashcard = await response.json();
      console.log('Flashcard added:', newFlashcard);
      toast.success('Flashcard added successfully!');
      form.reset(); // Clear form for the next flashcard
      onFlashcardAdded?.(); // Call optional callback

    } catch (error) {
      console.error('Error adding flashcard:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={frontId}>Front</FormLabel>
              <FormControl>
                <Textarea
                  id={frontId}
                  placeholder="Enter the front text of the flashcard"
                  className="min-h-[100px]"
                  aria-describedby={`${frontId}-count ${frontId}-message`}
                  {...field}
                />
              </FormControl>
              <div className="flex justify-end text-xs">
                 <span
                   id={`${frontId}-count`}
                   className={cn(
                     frontLength > FLASHCARD_LIMITS.FRONT_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
                   )}
                 >
                   {frontLength}/{FLASHCARD_LIMITS.FRONT_MAX_LENGTH}
                 </span>
              </div>
              <FormMessage id={`${frontId}-message`} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={backId}>Back</FormLabel>
              <FormControl>
                <Textarea
                  id={backId}
                  placeholder="Enter the back text of the flashcard"
                  className="min-h-[150px]"
                  aria-describedby={`${backId}-count ${backId}-message`}
                  {...field}
                />
              </FormControl>
               <div className="flex justify-end text-xs">
                 <span
                   id={`${backId}-count`}
                   className={cn(
                     backLength > FLASHCARD_LIMITS.BACK_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"
                   )}
                 >
                   {backLength}/{FLASHCARD_LIMITS.BACK_MAX_LENGTH}
                 </span>
               </div>
              <FormMessage id={`${backId}-message`} />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add & Create Next'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

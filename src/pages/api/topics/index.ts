import type { APIRoute } from "astro";
import { z } from "zod";
import type { TopicsResponseDto, TopicCreateDto, TopicResponseDto, ErrorResponse, TopicSummaryDto } from "@/types";
// Placeholder for actual database/service interaction
// import { supabase } from '@/db/supabase.client';
// import { getUser } from '@/lib/auth';

// Schema for creating a new topic
const createTopicSchema = z.object({
  name: z.string().min(1, "Topic name cannot be empty").max(100, "Topic name cannot exceed 100 characters"), // Added max length
});

// --- GET Handler ---
export const GET: APIRoute = async ({ request, locals }) => {
  // 1. Authentication (TEMPORARILY USING PLACEHOLDER)
  // TODO: Implement proper user fetching
  const user = { id: 'test-user-id' }; // !! TEMPORARY PLACEHOLDER USER !!
  if (!user) {
    // This condition will likely not be met with the placeholder, but keep for structure
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Not authenticated' } as ErrorResponse), { status: 401 });
  }

  // 2. Database Interaction
  try {
    // Fetch topics for the user, including flashcard count
    // Ensure RLS is set up for topics and flashcards
    const { data, error } = await locals.supabase
      .from('topics')
      .select(`
        id,
    //     name,
    //     created_at,
    //     updated_at,
    //     flashcards ( count )
    //   `)
      // .eq('user_id', user.id) // RLS should handle this automatically if configured
      .order('created_at', { ascending: false }); // Example ordering

    if (error) {
      console.error("Supabase fetch topics error:", error);
      throw new Error("Failed to fetch topics.");
    }

    // Map data to DTO, handling the flashcard count structure
    const topicsResponse: TopicsResponseDto = data?.map(topic => ({
      id: topic.id,
      name: topic.name,
      created_at: topic.created_at,
      updated_at: topic.updated_at,
      // Supabase returns count in an array like [{ count: 5 }]
      flashcard_count: Array.isArray(topic.flashcards) && topic.flashcards.length > 0 ? topic.flashcards[0].count : 0,
    })) || [];


    // 3. Return Success Response
    return new Response(JSON.stringify(topicsResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching topics:", error);
    return new Response(JSON.stringify({ error: true, code: 'INTERNAL_SERVER_ERROR', message: error instanceof Error ? error.message : 'An unexpected error occurred' } as ErrorResponse), { status: 500 });
  }
};


// --- POST Handler ---
export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Authentication (TEMPORARILY USING PLACEHOLDER)
  // TODO: Implement proper user fetching
  const user = { id: 'test-user-id' }; // !! TEMPORARY PLACEHOLDER USER !!
   if (!user) {
     // This condition will likely not be met with the placeholder, but keep for structure
     return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Not authenticated' } as ErrorResponse), { status: 401 });
   }

  // 2. Parse and Validate Request Body
  let requestBody: TopicCreateDto;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid JSON body' } as ErrorResponse), { status: 400 });
  }

  const validationResult = createTopicSchema.safeParse(requestBody);
  if (!validationResult.success) {
    return new Response(JSON.stringify({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid input data', details: validationResult.error.flatten() } as ErrorResponse), { status: 400 });
  }

  const { name } = validationResult.data;

  // 3. Database Interaction
  try {
    // Insert the new topic
    const { data: newTopic, error: insertError } = await locals.supabase
      .from('topics')
      .insert({
        name: name,
        user_id: user.id // Associate with the current user
      })
      .select('id, name, created_at, updated_at') // Select fields matching TopicResponseDto
      .single();

    if (insertError) {
      console.error("Supabase insert topic error:", insertError);
      // Handle potential unique constraint violation for topic name if needed
      if (insertError.code === '23505') { // Unique violation code
         return new Response(JSON.stringify({ error: true, code: 'CONFLICT', message: 'A topic with this name already exists.' } as ErrorResponse), { status: 409 });
      }
      throw new Error("Failed to create topic in database.");
    }
    if (!newTopic) {
       throw new Error("Database did not return the newly created topic.");
    }


    // 4. Return Success Response
    return new Response(JSON.stringify(newTopic), {
      status: 201, // 201 Created
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error creating topic:", error);
    return new Response(JSON.stringify({ error: true, code: 'INTERNAL_SERVER_ERROR', message: error instanceof Error ? error.message : 'An unexpected error occurred' } as ErrorResponse), { status: 500 });
  }
};

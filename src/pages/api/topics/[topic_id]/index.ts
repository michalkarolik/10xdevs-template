import type { APIRoute } from "astro";
import type { TopicDetailDto, ErrorResponse, FlashcardResponseDto } from "@/types";
// Placeholder for actual database/service interaction
// import { supabase } from '@/db/supabase.client';
// import { getUser } from '@/lib/auth';

export const GET: APIRoute = async ({ params, request, locals }) => {
  // 1. Authentication & Authorization
  // TODO: Implement proper user fetching, potentially from locals if middleware sets it up
  // const { user } = await locals.supabase.auth.getUser(); // Example using Supabase client from locals
  const user = { id: 'test-user-id' }; // !! TEMPORARY PLACEHOLDER USER !! Replace with actual auth logic

  if (!user) {
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Not authenticated' } as ErrorResponse), { status: 401 });
  }

  // 2. Validate Topic ID
  const { topic_id } = params;
  if (!topic_id) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Missing topic ID' } as ErrorResponse), { status: 400 });
  }
  const topicIdNum = parseInt(topic_id, 10);
  if (isNaN(topicIdNum)) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid topic ID format' } as ErrorResponse), { status: 400 });
  }

  // 3. Database Interaction
  try {
    // Fetch topic details and its flashcards, ensuring user owns the topic
    // Ensure RLS is enabled in Supabase for topics and flashcards tables based on user_id
    const { data: topicData, error: topicError } = await locals.supabase
      .from('topics')
      .select(`
        id,
        name,
        created_at,
        updated_at,
        flashcards ( id, front, back, source, created_at, updated_at )
      `)
      .eq('id', topicIdNum)
      // .eq('user_id', user.id) // RLS should handle this automatically if configured
      .single();

    if (topicError) {
      console.error("Supabase fetch error:", topicError);
      // PGRST116 is the code Supabase returns when .single() finds no rows (or more than one)
      if (topicError.code === 'PGRST116') {
         return new Response(JSON.stringify({ error: true, code: 'NOT_FOUND', message: 'Topic not found or access denied' } as ErrorResponse), { status: 404 });
      }
      // Log other errors for debugging
      console.error("Unexpected Supabase error:", topicError);
      throw new Error("Failed to fetch topic details due to database error.");
    }

    // Although RLS handles access, double-check if data is null (might happen if RLS prevents access but no error is thrown explicitly in some cases)
    if (!topicData) {
       console.warn(`No topic data returned for ID ${topicIdNum}, potentially due to RLS.`);
       return new Response(JSON.stringify({ error: true, code: 'NOT_FOUND', message: 'Topic not found or access denied' } as ErrorResponse), { status: 404 });
    }

    // Ensure flashcards array exists, even if empty
    const responsePayload: TopicDetailDto = {
        ...topicData,
        flashcards: topicData.flashcards || [],
    };

    // 4. Return Success Response
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching topic details:", error);
    return new Response(JSON.stringify({ error: true, code: 'INTERNAL_SERVER_ERROR', message: error instanceof Error ? error.message : 'An unexpected error occurred' } as ErrorResponse), { status: 500 });
  }
};

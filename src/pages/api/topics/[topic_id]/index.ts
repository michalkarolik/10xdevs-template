import type { APIRoute } from "astro";
import type { TopicDetailDto, ErrorResponse, FlashcardResponseDto } from "@/types";
// Placeholder for actual database/service interaction
// import { supabase } from '@/db/supabase.client';
// import { getUser } from '@/lib/auth';

export const GET: APIRoute = async ({ params, request, locals }) => {
  // 1. Authentication & Authorization (TEMPORARILY USING PLACEHOLDER)
  // TODO: Implement proper user fetching
  const user = { id: '11111111-1111-1111-1111-111111111111' }; // !! TEMPORARY PLACEHOLDER USER (Valid UUID format) !!

  if (!user) {
     // This condition will likely not be met with the placeholder, but keep for structure
    return new Response(JSON.stringify({ error: true, code: 'UNAUTHORIZED', message: 'Not authenticated' } as ErrorResponse), { status: 401 });
  }

  // 2. Validate Topic ID
  const { topic_id } = params;
  if (!topic_id) {
    return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Missing topic ID' } as ErrorResponse), { status: 400 });
  }
  // Validate if topic_id looks like a UUID (basic check) - PostgreSQL will validate it strictly anyway
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(topic_id)) {
     return new Response(JSON.stringify({ error: true, code: 'BAD_REQUEST', message: 'Invalid topic ID format (must be a UUID)' } as ErrorResponse), { status: 400 });
  }
  // We no longer parse topic_id to a number (topicIdNum)

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
      .eq('id', topic_id) // Use the topic_id string directly
      // .eq('user_id', user.id) // RLS should handle this automatically if configured
      .single();

    if (topicError) {
      console.error("Supabase fetch error:", topicError);
      // PGRST116 is the code Supabase returns when .single() finds no rows (or more than one)
      if (topicError.code === 'PGRST116') {
         return new Response(JSON.stringify({ error: true, code: 'NOT_FOUND', message: 'Topic not found or access denied' } as ErrorResponse), { status: 404 });
      }
      // Log other errors for debugging with more detail
      console.error("Unexpected Supabase error object:", JSON.stringify(topicError, null, 2)); // Log the full error object
      throw new Error(`Failed to fetch topic details due to database error. Code: ${topicError.code}, Message: ${topicError.message}`); // Include code and message in thrown error
    }

    // Although RLS handles access, double-check if data is null (might happen if RLS prevents access but no error is thrown explicitly in some cases)
    if (!topicData) {
       console.warn(`No topic data returned for ID ${topic_id}, potentially due to RLS.`); // Use topic_id string in log
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

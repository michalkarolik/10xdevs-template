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
    // Step 3.1: Fetch basic topic details first to verify existence and access
    const { data: topicBaseData, error: topicBaseError } = await locals.supabase
      .from('topics')
      .select('id, name, created_at, updated_at') // Select only topic fields
      .eq('id', topic_id)
      // .eq('user_id', user.id) // RLS should handle this
      .single();

    if (topicBaseError) {
      console.error("Supabase topic fetch error:", topicBaseError);
      // PGRST116 is the code Supabase returns when .single() finds no rows
      if (topicBaseError.code === 'PGRST116') {
         return new Response(JSON.stringify({ error: true, code: 'NOT_FOUND', message: 'Topic not found or access denied' } as ErrorResponse), { status: 404 });
      }
      // Log other errors
      console.error("Unexpected Supabase error object:", JSON.stringify(topicBaseError, null, 2));
      throw new Error(`Failed to fetch topic base details. Code: ${topicBaseError.code}, Message: ${topicBaseError.message}`);
    }

    // Double-check if data is null (should be caught by PGRST116, but good practice)
    if (!topicBaseData) {
       console.warn(`No topic base data returned for ID ${topic_id}, potentially due to RLS.`);
       return new Response(JSON.stringify({ error: true, code: 'NOT_FOUND', message: 'Topic not found or access denied' } as ErrorResponse), { status: 404 });
    }

    // Step 3.2: Call the RPC function to get sorted flashcards
    const { data: flashcardsData, error: rpcError } = await locals.supabase.rpc(
      'get_topic_flashcards_with_history',
      {
        p_topic_id: topic_id, // Pass topic ID
        p_user_id: user.id    // Pass user ID
      }
    );

    if (rpcError) {
      console.error("Supabase RPC call error (get_topic_flashcards_with_history):", rpcError);
      throw new Error(`Failed to fetch sorted flashcards via RPC. Code: ${rpcError.code}, Message: ${rpcError.message}`);
    }

    // The RPC function returns an array of flashcards (or null/empty array if none)
    // We need to ensure the structure matches FlashcardResponseDto expected by TopicDetailDto
    const formattedFlashcards: FlashcardResponseDto[] = (flashcardsData || []).map(fc => ({
      id: fc.id,
      front: fc.front,
      back: fc.back,
      source: fc.source,
      created_at: fc.created_at,
      updated_at: fc.updated_at,
      // Add last_response and last_reviewed_at if needed in the DTO, otherwise omit
      // last_response: fc.last_response,
      // last_reviewed_at: fc.last_reviewed_at,
    }));


    // Step 3.3: Combine topic data and sorted flashcards into the response payload
    const responsePayload: TopicDetailDto = {
      ...topicBaseData, // Use the base topic data fetched earlier
      flashcards: formattedFlashcards, // Use the sorted flashcards from RPC
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

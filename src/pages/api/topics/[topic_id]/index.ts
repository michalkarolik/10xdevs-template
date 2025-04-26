import type { APIRoute } from "astro";
import type { ErrorResponse, FlashcardResponseDto, TopicDetailDto } from "@/types";
import { getUserFromToken } from "@src/lib/server/authenticationService";
import { AUTH_TOKEN_COOKIE, getCookie } from "@src/lib/cookies";

export async function fetchTopicDetails(topic_id: string, user: unknown, supabase: unknown): Promise<TopicDetailDto> {
  const { data: topicBaseData, error: topicBaseError } = await supabase
    .from("topics")
    .select("id, name, created_at, updated_at")
    .eq("id", topic_id)
    .single();

  if (topicBaseError) {
    console.error("Supabase topic fetch error:", topicBaseError);
    if (topicBaseError.code === "PGRST116") {
      throw new Error("NOT_FOUND");
    }
    throw new Error(
      `Failed to fetch topic base details. Code: ${topicBaseError.code}, Message: ${topicBaseError.message}`
    );
  }
  if (!topicBaseData) {
    console.warn(`No topic base data returned for ID ${topic_id}`);
    throw new Error("NOT_FOUND");
  }

  const { data: flashcardsData, error: rpcError } = await supabase.rpc("get_topic_flashcards_with_history", {
    p_topic_id: topic_id,
    p_user_id: user.id,
  });
  if (rpcError) {
    console.error("Supabase RPC call error (get_topic_flashcards_with_history):", rpcError);
    throw new Error(`Failed to fetch sorted flashcards via RPC. Code: ${rpcError.code}, Message: ${rpcError.message}`);
  }

  const formattedFlashcards: FlashcardResponseDto[] = (flashcardsData || []).map((fc) => ({
    id: fc.id,
    front: fc.front,
    back: fc.back,
    source: fc.source,
    created_at: fc.created_at,
    updated_at: fc.updated_at,
  }));

  return { ...topicBaseData, flashcards: formattedFlashcards };
}

export const GET: APIRoute = async ({ params, request, locals }) => {
  const cookieHeader = request.headers.get("cookie") || "";
  console.log("Extracting token from cookies,", cookieHeader);
  const token = getCookie(AUTH_TOKEN_COOKIE, cookieHeader);
  if (!token) {
    return new Response(
      JSON.stringify({ error: true, code: "UNAUTHORIZED", message: "Missing authentication token" } as ErrorResponse),
      { status: 401 }
    );
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({ error: true, code: "UNAUTHORIZED", message: "Invalid authentication token" } as ErrorResponse),
      { status: 401 }
    );
  }

  const { topic_id } = params;
  if (!topic_id) {
    return new Response(
      JSON.stringify({ error: true, code: "BAD_REQUEST", message: "Missing topic ID" } as ErrorResponse),
      { status: 400 }
    );
  }
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(topic_id)) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "BAD_REQUEST",
        message: "Invalid topic ID format (must be a UUID)",
      } as ErrorResponse),
      { status: 400 }
    );
  }

  try {
    const responsePayload = await fetchTopicDetails(topic_id, user, locals.supabase);
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching topic details:", error);
    let status = 500,
      message = "Internal Server Error";
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        status = 404;
        message = "Topic not found or access denied";
      } else {
        message = error.message;
      }
    }
    return new Response(
      JSON.stringify({
        error: true,
        code: status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message,
      } as ErrorResponse),
      { status }
    );
  }
};

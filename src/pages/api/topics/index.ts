import type { APIRoute } from "astro";
import { z } from "zod";
import { getUserFromToken } from "../../../lib/server/authenticationService";
import { db } from "../../../lib/server/db";
import type { ErrorResponse, TopicCreateDto } from "@/types";

const createTopicSchema = z.object({
  name: z.string().min(1, "Topic name cannot be empty").max(100, "Topic name cannot exceed 100 characters"),
});

export const GET: APIRoute = async ({ request }) => {
  try {
    const cookies = request.headers.get("cookie") || "";
    const tokenMatch = cookies.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!token) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await getUserFromToken(token);

    if (!user) {
      console.error("Failed to get user from token");
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("User authenticated:", user.id);

    const { data: topics, error } = await db.supabase
      .from("topics")
      .select("id, name, created_at, updated_at, flashcards(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching topics:", error);
      return new Response(JSON.stringify({ error: "Error fetching topics" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mappedTopics = topics.map((topic: unknown) => ({
      ...topic,
      flashcard_count: topic.flashcards?.[0]?.count || 0,
    }));

    return new Response(JSON.stringify({ topics: mappedTopics }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in topics API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const cookies = request.headers.get("cookie") || "";
  const tokenMatch = cookies.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "UNAUTHORIZED",
        message: "Missing authentication token",
      } as ErrorResponse),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "UNAUTHORIZED",
        message: "Invalid authentication token",
      } as ErrorResponse),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let requestBody: TopicCreateDto;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: true,
        code: "BAD_REQUEST",
        message: "Invalid JSON body",
      } as ErrorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const validationResult = createTopicSchema.safeParse(requestBody);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: true,
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: validationResult.error.flatten(),
      } as ErrorResponse),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { name } = validationResult.data;

  try {
    const { data: newTopic, error: insertError } = await db.supabase
      .from("topics")
      .insert({
        name: name,
        user_id: user.id,
      })
      .select("id, name, created_at, updated_at")
      .single();

    if (insertError) {
      console.error("Supabase insert topic error:", insertError);
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({
            error: true,
            code: "CONFLICT",
            message: "A topic with this name already exists.",
          } as ErrorResponse),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw new Error("Failed to create topic in database.");
    }

    if (!newTopic) {
      throw new Error("Database did not return the newly created topic.");
    }

    return new Response(JSON.stringify(newTopic), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    return new Response(
      JSON.stringify({
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      } as ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

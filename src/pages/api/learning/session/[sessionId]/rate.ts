import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, params }) => {
  try {
    console.log(`Processing request for session: ${params.sessionId}`);
    const sessionId = params.sessionId;

    if (!sessionId) {
      console.error("Missing sessionId in params");
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the request body
    const body = await request.json();
    console.log("Request body:", body);

    // Extract values matching the client's property names
    const flashcardId = body.card_id;
    const userResponse = body.rating;

    console.log("Extracted values:", {
      flashcardId: flashcardId,
      userResponse: userResponse,
    });

    // Use the correct environment variables
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials missing");
      return new Response(JSON.stringify({ error: "Database configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create the insert object using the correct field names for the database
    const insertData = {
      learning_session_id: sessionId,
      flashcard_id: flashcardId,
      user_response: userResponse,
    };

    console.log("Saving to database:", insertData);

    // Validate inputs before inserting
    if (!flashcardId) {
      return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!userResponse) {
      return new Response(JSON.stringify({ error: "User response is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert data into database
    const { error } = await supabase.from("learning_session_flashcards").insert([insertData]);

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Rating saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Flashcard rating saved successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error in rate endpoint:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

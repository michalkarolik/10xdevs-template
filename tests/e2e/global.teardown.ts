import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

teardown("delete test data", async () => {
  console.log("Cleaning up test database...");

  // Use environment variables from .env.test
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables");
    throw new Error("Missing Supabase credentials");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const testUserId = process.env.E2E_USERNAME_ID;

  try {
    // Delete in order of dependencies to avoid foreign key constraint errors

    // 1. First delete learning_session_flashcards (junction table)
    const { data: sessionIds, error: sessionIdsError } = await supabase
      .from("learning_sessions")
      .select("id")
      .eq("user_id", testUserId);
    if (sessionIdsError) throw sessionIdsError;
    const sessionIdArray = sessionIds.map((s) => s.id);

    const { error: sessionFlashcardsError } = await supabase
      .from("learning_session_flashcards")
      .delete()
      .in("learning_session_id", sessionIdArray);

    if (sessionFlashcardsError) throw sessionFlashcardsError;

    // 2. Delete learning_sessions for the test user
    const { error: sessionsError } = await supabase.from("learning_sessions").delete().eq("user_id", testUserId);

    if (sessionsError) throw sessionsError;

    // 3. Delete flashcards associated with the test user's topics
    const { data: topicIds, error: topicIdsError } = await supabase
      .from("topics")
      .select("id")
      .eq("user_id", testUserId);
    if (topicIdsError) throw topicIdsError;
    const topicIdArray = topicIds.map((t) => t.id);

    const { error: flashcardsError } = await supabase.from("flashcards").delete().in("topic_id", topicIdArray);

    if (flashcardsError) throw flashcardsError;

    // 4. Delete topics for the test user
    const { error: topicsError } = await supabase.from("topics").delete().eq("user_id", testUserId);

    if (topicsError) throw topicsError;

    console.log("Test database cleaned up successfully");
  } catch (error) {
    console.error("Failed to clean up test database:", error);
    throw error;
  }
});

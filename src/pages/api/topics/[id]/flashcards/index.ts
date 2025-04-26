import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { FlashcardsResponseDto } from "@/types";

// Simple in-memory cache for flashcard data to reduce database queries
const flashcardCache: Record<string, { data: unknown[]; timestamp: number }> = {};
const CACHE_TTL = 60000; // 1 minute cache TTL

export default async function handler(req: NextApiRequest, res: NextApiResponse<FlashcardsResponseDto | unknown>) {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get topic ID from the URL
  const { id: topicId } = req.query;

  if (!topicId || typeof topicId !== "string") {
    return res.status(400).json({ error: "Invalid topic ID" });
  }

  // Added cache-control headers to improve caching behavior
  res.setHeader("Cache-Control", "public, max-age=60");

  switch (req.method) {
    case "GET":
      try {
        // Check if we have cached data for this topic
        if (flashcardCache[topicId] && Date.now() - flashcardCache[topicId].timestamp < CACHE_TTL) {
          console.log(`Using cached flashcards for topic: ${topicId}`);
          return res.status(200).json(flashcardCache[topicId].data);
        }

        console.log(`Fetching flashcards for topic: ${topicId}`);

        // Query flashcards for the specific topic
        const { data, error } = await supabase
          .from("flashcards")
          .select("id, front, back, source, created_at, updated_at")
          .eq("topic_id", topicId);

        if (error) {
          console.error("Supabase error:", error);
          return res.status(500).json({ error: "Failed to fetch flashcards" });
        }

        // Store in cache
        flashcardCache[topicId] = {
          data: data || [],
          timestamp: Date.now(),
        };

        console.log(`Found ${data?.length || 0} flashcards for topic ${topicId}`);
        return res.status(200).json(data || []);
      } catch (err) {
        console.error("Error fetching flashcards:", err);
        return res.status(500).json({ error: "Failed to fetch flashcards" });
      }

    case "POST":
      try {
        const { front, back } = req.body;

        if (!front || !back) {
          return res.status(400).json({ error: "Missing front or back content" });
        }

        // Create a new flashcard with source=manual
        const { data, error } = await supabase
          .from("flashcards")
          .insert([
            {
              front,
              back,
              topic_id: topicId,
              source: "manual",
            },
          ])
          .select("id, front, back, source, created_at, updated_at")
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          return res.status(500).json({ error: "Failed to create flashcard" });
        }

        // Invalidate cache for this topic
        flashcardCache[topicId] = undefined;

        return res.status(201).json(data);
      } catch (err) {
        console.error("Error creating flashcard:", err);
        return res.status(500).json({ error: "Failed to create flashcard" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

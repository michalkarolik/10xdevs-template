import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { ErrorResponse, FlashcardsResponseDto } from "@/types";

// In-memory cache to avoid frequent database calls
const flashcardCache: Record<string, { data: unknown[]; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FlashcardsResponseDto | ErrorResponse>
) {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Add CORS headers for development environments
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Get topic ID from the URL
  const { topic_id } = req.query;

  if (!topic_id || typeof topic_id !== "string") {
    return res.status(400).json({
      error: true,
      code: "INVALID_TOPIC_ID",
      message: "Invalid topic ID",
    });
  }

  console.log(`API handler called for topic_id: ${topic_id}, method: ${req.method}`);

  switch (req.method) {
    case "GET":
      try {
        // Check if we have cached data
        const cacheKey = `flashcards_${topic_id}`;
        const cachedData = flashcardCache[cacheKey];
        const now = Date.now();

        if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
          console.log(`Using cached flashcards for topic: ${topic_id}`);
          return res.status(200).json(cachedData.data);
        }

        console.log(`Fetching flashcards for topic: ${topic_id}`);

        // Query flashcards for the specific topic
        const { data, error } = await supabase
          .from("flashcards")
          .select("id, front, back, source, created_at, updated_at")
          .eq("topic_id", topic_id);

        if (error) {
          console.error("Supabase error:", error);
          return res.status(500).json({
            error: true,
            code: "DATABASE_ERROR",
            message: "Failed to fetch flashcards",
            details: error,
          });
        }

        // Update cache
        flashcardCache[cacheKey] = {
          data: data || [],
          timestamp: now,
        };

        console.log(`Found ${data?.length || 0} flashcards for topic ${topic_id}`);
        return res.status(200).json(data || []);
      } catch (err) {
        console.error("Error fetching flashcards:", err);
        return res.status(500).json({
          error: true,
          code: "SERVER_ERROR",
          message: "Failed to fetch flashcards",
        });
      }

    case "POST":
      try {
        const { front, back } = req.body;

        if (!front || !back) {
          return res.status(400).json({
            error: true,
            code: "INVALID_FLASHCARD_DATA",
            message: "Missing front or back content",
          });
        }

        // Create a new flashcard with source=manual
        const { data, error } = await supabase
          .from("flashcards")
          .insert([
            {
              front,
              back,
              topic_id,
              source: "manual",
            },
          ])
          .select("id, front, back, source, created_at, updated_at")
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          return res.status(500).json({
            error: true,
            code: "DATABASE_ERROR",
            message: "Failed to create flashcard",
            details: error,
          });
        }

        return res.status(201).json(data);
      } catch (err) {
        console.error("Error creating flashcard:", err);
        return res.status(500).json({
          error: true,
          code: "SERVER_ERROR",
          message: "Failed to create flashcard",
        });
      }

    default:
      return res.status(405).json({
        error: true,
        code: "METHOD_NOT_ALLOWED",
        message: "Method not allowed",
      });
  }
}

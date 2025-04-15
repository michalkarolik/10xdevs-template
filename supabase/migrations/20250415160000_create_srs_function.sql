-- Ensure the flashcard_source enum type exists before creating the function that uses it.
-- This should ideally be in the migration that created the 'flashcards' table,
-- but adding it here ensures this migration runs successfully.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flashcard_source' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.flashcard_source AS ENUM ('ai-generated', 'ai-edited', 'manual');
    END IF;
END
$$;

-- Function to get flashcards for a topic, sorted by SRS logic for a specific user
-- Returns flashcards ordered by: Never Seen > Again > Hard > Easy
-- Within the same priority, oldest reviewed (or never reviewed) comes first.
CREATE OR REPLACE FUNCTION public.get_topic_flashcards_with_history(
    p_topic_id uuid,
    p_user_id uuid
)
RETURNS SETOF RECORD -- Changed to SETOF RECORD for flexibility
LANGUAGE sql
STABLE
AS $$
WITH LatestResponses AS (
    SELECT DISTINCT ON (lsf.flashcard_id)
        lsf.flashcard_id,
        lsf.user_response,
        lsf.created_at
    FROM public.learning_session_flashcards lsf
    JOIN public.learning_sessions ls ON lsf.learning_session_id = ls.id
    WHERE ls.user_id = p_user_id
      AND lsf.flashcard_id IN (SELECT f_inner.id FROM public.flashcards f_inner WHERE f_inner.topic_id = p_topic_id)
    ORDER BY lsf.flashcard_id, lsf.created_at DESC
)
SELECT
    f.id,
    f.front,
    f.back,
    f.source,
    f.created_at,
    f.updated_at,
    lr.user_response AS last_response,
    lr.created_at AS last_reviewed_at
FROM public.flashcards f
         LEFT JOIN LatestResponses lr ON f.id = lr.flashcard_id
WHERE f.topic_id = p_topic_id
ORDER BY
    CASE
        WHEN lr.user_response IS NULL THEN 4
        WHEN lr.user_response = 'Again' THEN 3
        WHEN lr.user_response = 'Hard' THEN 2
        WHEN lr.user_response = 'Easy' THEN 1
        ELSE 0
        END DESC,
    lr.created_at ASC NULLS FIRST;
$$;
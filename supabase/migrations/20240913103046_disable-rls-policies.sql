-- Disable RLS for topics table (recommended for development)
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;

-- For the flashcards table, drop any policies that reference a non-existent "user_id" column
DROP POLICY IF EXISTS "default_policy" ON flashcards;
DROP POLICY IF EXISTS "Allow insert for flashcards" ON flashcards;
DROP POLICY IF EXISTS "Allow all operations for flashcards" ON flashcards;

-- Then disable row-level security for flashcards
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;

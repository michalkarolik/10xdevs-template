CREATE TABLE learning_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE learning_session_flashcards (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_session_id uuid NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_response text NOT NULL CHECK (user_response IN ('Again', 'Hard', 'Easy')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_session_flashcards_learning_session_id ON learning_session_flashcards(learning_session_id);
CREATE INDEX idx_learning_session_flashcards_flashcard_id ON learning_session_flashcards(flashcard_id);

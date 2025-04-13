CREATE TABLE learning_session (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_response text NOT NULL CHECK (user_response IN ('Again', 'Hard', 'Easy')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_session_flashcard_id ON learning_session(flashcard_id);
CREATE INDEX idx_learning_session_user_response ON learning_session(user_response);

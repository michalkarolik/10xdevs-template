# API Plan for AI Flashcard Generator

This document outlines the RESTful API design for the AI Flashcard Generator application, connecting the frontend with Supabase backend services and AI integration.

## 2. Topics API

Manage user topics for organizing flashcards.

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/topics` | GET | Get all topics for current user | - | `[{ id, name, created_at, updated_at, flashcard_count }]` |
| `/topics` | POST | Create new topic | `{ name }` | `{ id, name, created_at, updated_at }` |
| `/topics/:id` | GET | Get single topic details | - | `{ id, name, created_at, updated_at, flashcards: [...] }` |
| `/topics/:id` | PUT | Update topic | `{ name }` | `{ id, name, updated_at }` |
| `/topics/:id` | DELETE | Delete topic | - | `{ success: true }` |

## 3. Flashcards API

Manage flashcards within topics.

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/topics/:topic_id/flashcards` | GET | Get all flashcards in a topic | - | `[{ id, front, back, source, created_at, updated_at }]` |
| `/topics/:topic_id/flashcards` | POST | Create new flashcard manually | `{ front, back }` | `{ id, front, back, source: "manual", created_at, updated_at }` |
| `/topics/:topic_id/flashcards/:id` | GET | Get single flashcard details | - | `{ id, front, back, source, created_at, updated_at }` |
| `/topics/:topic_id/flashcards/:id` | PUT | Update flashcard | `{ front, back }` | `{ id, front, back, source, updated_at }` |
| `/topics/:topic_id/flashcards/:id` | DELETE | Delete flashcard | - | `{ success: true }` |

## 4. AI Generation API

Generate flashcards using AI based on text input.

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/topics/:topic_id/generate` | POST | Generate flashcards from text | `{ source_text }` | `[{ front, back, exceeds_limit }]` |
| `/topics/:topic_id/generate/alternative` | POST | Generate alternative for a flashcard | `{ source_text, original_front, original_back }` | `{ front, back, exceeds_limit }` |
| `/topics/:topic_id/accept` | POST | Accept AI-generated flashcard | `{ front, back }` | `{ id, front, back, source: "ai-generated", created_at, updated_at }` |
| `/topics/:topic_id/accept-edited` | POST | Accept AI-generated flashcard with edits | `{ front, back }` | `{ id, front, back, source: "ai-edited", created_at, updated_at }` |

## 5. Learning API

Manage spaced repetition learning sessions.

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/learning/session` | POST | Start new learning session | `{ topic_id }` or `{ all: true }` | `{ session_id, cards_count, first_card: {...} }` |
| `/learning/session/:session_id/next` | GET | Get next card in session | - | `{ card_id, front, back, position, total }` |
| `/learning/session/:session_id/rate` | POST | Rate flashcard knowledge | `{ card_id, rating }` | `{ next_review_date, next_card: {...} }` |
| `/learning/stats` | GET | Get learning statistics | - | `{ cards_learned, mastery_level, streaks }` |

## 6. Error Handling

All API endpoints will return standardized error responses:

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {} // Optional additional information
}
```

Common error codes:

- `RESOURCE_NOT_FOUND`: Requested resource not found
- `PERMISSION_DENIED`: User doesn't have permission
- `AI_SERVICE_ERROR`: Error from AI service
- `LIMIT_EXCEEDED`: Character limit exceeded

## 7. Implementation Notes

### Supabase Integration

- Authentication will leverage Supabase Auth directly with custom handlers
- Database operations will use Supabase's PostgreSQL with Row Level Security (RLS) policies
- API will be implemented using Supabase Functions or a custom API layer depending on complexity

### AI Integration

- The AI generation endpoints will communicate with OpenRouter.ai
- Prompt engineering will focus on generating high-quality flashcard content
- The system will implement rate limiting and error handling for AI service

### Character Limits Validation

- All endpoints accepting flashcard content will validate against limits:
  - Front side: maximum 100 characters
  - Back side: maximum 500 characters

### Metrics Collection

- API will include telemetry to measure key metrics:
  - AI flashcard acceptance rate
  - AI usage in flashcard creation
  - Session completion rates

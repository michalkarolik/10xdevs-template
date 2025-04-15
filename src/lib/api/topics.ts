import type { TopicSummaryDto } from '@/types';

/**
 * Fetches all topics for the current user
 */
export async function getTopics(): Promise<TopicSummaryDto[]> {
  const response = await fetch('/api/topics');
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch topics: ${response.status}`);
  }
  return response.json();
}

/**
 * Creates a new topic
 */
export async function createTopic(name: string): Promise<TopicSummaryDto> {
  const response = await fetch('/api/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create topic: ${response.status}`);
  }
  
  return response.json();
}

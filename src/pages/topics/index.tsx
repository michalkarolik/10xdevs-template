import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTopicModal } from "@/components/topics/AddTopicModal";
import { useToast } from "@/components/ui/use-toast";

interface Topic {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  flashcard_count?: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const { toast } = useToast();

  // Load topics on component mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/topics", {
        credentials: "include", // Include cookies with the request
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setTopics(data.topics || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setError("Failed to load topics. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTopic = async (topicName: string) => {
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: topicName }),
        credentials: "include", // Include cookies with the request
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const newTopic = await response.json();
      setTopics((prevTopics) => [...prevTopics, newTopic]);

      toast({
        title: "Topic created",
        description: `"${topicName}" has been successfully created.`,
      });
    } catch (err) {
      console.error("Failed to create topic:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create topic. Please try again.",
      });
      throw err;
    }
  };

  return (
    <div className="container mx-auto py-6" data-test-id="topics-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Topics</h1>
        <Button onClick={() => setIsAddTopicModalOpen(true)} data-test-id="add-topic-button">
          Add New Topic
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading topics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center p-10 border rounded-md">
          <p className="text-gray-600">You don&apos;t have any topics yet. Create your first topic to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-test-id="topics-grid">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="border rounded-md p-4 hover:shadow-md transition-shadow"
              data-test-id={`topic-item-${topic.id}`}
            >
              <h2 className="text-xl font-semibold mb-2">{topic.name}</h2>
              <p className="text-gray-600" data-test-id={`topic-flashcard-count-${topic.id}`}>
                {topic.flashcard_count || 0} flashcards
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/topics/${topic.id}`} data-test-id={`view-topic-${topic.name}`}>
                    View Details
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTopicModal open={isAddTopicModalOpen} onOpenChange={setIsAddTopicModalOpen} onAddTopic={handleAddTopic} />
    </div>
  );
}

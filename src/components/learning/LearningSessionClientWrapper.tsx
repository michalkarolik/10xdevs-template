import React, { useState, useEffect, useRef } from 'react';
import LearningSessionView from './LearningSessionView';
import type { TopicSummaryDto } from '@/types';

interface LearningSessionClientWrapperProps {
  topics: TopicSummaryDto[];
}

export default function LearningSessionClientWrapper({ topics = [] }: LearningSessionClientWrapperProps) {
  const [localTopics, setLocalTopics] = useState<TopicSummaryDto[]>(topics);
  const topicsFetchedRef = useRef(false);
  
  // Only fetch topics once on mount if they're empty, using a ref to track this
  useEffect(() => {
    if (topics.length > 0) {
      setLocalTopics(topics);
      return;
    }
    
    // Only fetch if topics are empty AND we haven't fetched yet
    if (topics.length === 0 && !topicsFetchedRef.current) {
      console.log('No topics provided from server, fetching once from client...');
      topicsFetchedRef.current = true;
      
      fetch('/api/topics')
        .then(response => {
          if (!response.ok) throw new Error(`Error: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('Topics fetched from client:', data.length);
          setLocalTopics(data);
        })
        .catch(error => {
          console.error('Failed to fetch topics from client:', error);
        });
    }
  }, [topics]);

  // Function to handle navigation when a topic is selected
  const navigateToTopic = (topicId: string) => {
    // For client-side routing in Astro
    if (window.location.pathname !== `/learning-session/${topicId}`) {
      window.history.pushState({}, '', `/learning-session/${topicId}`);
    }
  };

  return (
    <LearningSessionView 
      topics={localTopics} 
      navigate={navigateToTopic}
    />
  );
}

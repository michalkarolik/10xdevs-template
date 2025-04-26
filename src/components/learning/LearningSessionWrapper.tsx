import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LearningSessionView from "./LearningSessionView";
import type { TopicSummaryDto } from "@/types";
import { useLearningSession } from "@/hooks/useLearningSession";

interface LearningSessionWrapperProps {
  initialTopics: TopicSummaryDto[];
}

export const LearningSessionWrapper: React.FC<LearningSessionWrapperProps> = ({ initialTopics }) => {
  const navigate = useNavigate();
  const { topics } = useLearningSession(initialTopics);

  const handleTopicChange = useCallback(
    (topicId: string) => {
      navigate(`/learning-session/${topicId}`);
    },
    [navigate]
  );

  return <LearningSessionView topics={topics} navigate={handleTopicChange} />;
};

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import LearningSessionView from './LearningSessionView';
import type { TopicSummaryDto } from '@/types';

interface LearningSessionClientWrapperProps {
  initialTopics: TopicSummaryDto[];
}

const LearningSessionClientWrapper: React.FC<LearningSessionClientWrapperProps> = ({ initialTopics }) => {
  // This component will only render on the client thanks to client:only in the Astro file.
  // Therefore, BrowserRouter and LearningSessionView (with its useParams hook)
  // will only execute in a browser environment.
  return (
    <BrowserRouter>
      <LearningSessionView initialTopics={initialTopics} />
    </BrowserRouter>
  );
};

export default LearningSessionClientWrapper;

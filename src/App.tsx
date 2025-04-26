import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TopicsPage from "./pages/TopicsPage";
import { useEffect, useState } from "react";
import type { TopicSummaryDto } from "./types";
import { LearningSessionWrapper } from "./components/learning/LearningSessionWrapper";

function App() {
  const [initialTopics, setInitialTopics] = useState<TopicSummaryDto[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch("/api/topics");
        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.status}`);
        }
        const data = await response.json();
        setInitialTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route
          path="/learning-session/:topicId"
          element={initialTopics.length > 0 ? <LearningSessionWrapper initialTopics={initialTopics} /> : null}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

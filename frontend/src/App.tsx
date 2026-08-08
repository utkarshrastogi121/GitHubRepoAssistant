// Router setup - maps URL paths to pages.

import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import HomePage from "@/pages/HomePage";
import RepoDetailPage from "@/pages/RepoDetailPage";
import ChatPage from "@/pages/ChatPage";
import DocsPage from "@/pages/DocsPage";
import ReviewPage from "@/pages/ReviewPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/repos/:id" element={<RepoDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </div>
  );
}

// RAG chat page. Requires an active repo (selected via HomePage/RepoDetailPage).
// Flow: index the repo once, then send messages - matches
// POST /chat/:repoId/index and POST /chat/:repoId/message.

import { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { useRepo } from "@/contexts/RepoContext";
import { indexRepo, sendMessage } from "@/api/chat";
import { ChatMessage } from "@/types";

export default function ChatPage() {
  const { activeRepo } = useRepo();
  const [isIndexed, setIsIndexed] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Pick<ChatMessage, "role" | "content">[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!activeRepo) {
    return (
      <PageContainer title="Chat">
        <ErrorBanner message="No repository selected. Analyze or select a repository first." />
        <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Go to Repositories
        </Link>
      </PageContainer>
    );
  }

  async function handleIndex() {
    setIsIndexing(true);
    setError(null);
    try {
      await indexRepo(activeRepo!.id);
      setIsIndexed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to index repository");
    } finally {
      setIsIndexing(false);
    }
  }

  async function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: "USER", content: text }]);
    setIsSending(true);
    setError(null);
    try {
      const response = await sendMessage(activeRepo!.id, text, sessionId);
      setSessionId(response.sessionId);
      setMessages((prev) => [...prev, { role: "ASSISTANT", content: response.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a response");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <PageContainer
      title={`Chat with ${activeRepo.owner}/${activeRepo.name}`}
      description="Ask questions about the codebase. The repository must be indexed first (one-time step)."
    >
      {!isIndexed && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-sm text-brand-800">
            Index this repository before chatting. This chunks the code and stores it for retrieval.
          </p>
          <Button onClick={handleIndex} isLoading={isIndexing}>
            Index Repository
          </Button>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="flex h-[60vh] flex-col rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex-1 overflow-y-auto">
          <ChatWindow messages={messages} isThinking={isSending} />
        </div>
        <div className="mt-3">
          <ChatInput onSend={handleSend} isSending={isSending} disabled={!isIndexed} />
        </div>
      </div>
    </PageContainer>
  );
}

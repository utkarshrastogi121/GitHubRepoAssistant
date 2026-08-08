import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { Spinner } from "@/components/common/Spinner";

interface ChatWindowProps {
  messages: Pick<ChatMessage, "role" | "content">[];
  isThinking: boolean;
}

export function ChatWindow({ messages, isThinking }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Ask a question about the repository to get started.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-1 py-2">
      {messages.map((message, i) => (
        <ChatMessageBubble key={i} message={message} />
      ))}
      {isThinking && (
        <div className="flex justify-start">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5">
            <Spinner />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

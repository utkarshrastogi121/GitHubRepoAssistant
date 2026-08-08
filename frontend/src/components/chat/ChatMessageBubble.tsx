import { ChatMessage } from "@/types";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface ChatMessageBubbleProps {
  message: Pick<ChatMessage, "role" | "content">;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser ? "bg-brand-600 text-white" : "border border-gray-200 bg-white text-gray-800"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isSending: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isSending, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder={disabled ? "Index the repository first..." : "Ask a question about this repository..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50"
      />
      <Button type="submit" isLoading={isSending} disabled={disabled}>
        Send
      </Button>
    </form>
  );
}

// Builds the final prompt sent to Gemini for RAG-based chat answers.
// Plain string templates - no prompt-templating library needed.

import { RetrievedChunk } from "../types";

interface ChatHistoryItem {
  role: "USER" | "ASSISTANT";
  content: string;
}

export function buildRagPrompt(
  question: string,
  chunks: RetrievedChunk[],
  history: ChatHistoryItem[]
): string {
  const context = chunks
    .map((c) => `File: ${c.filePath}\n---\n${c.content}`)
    .join("\n\n");

  const historyText = history
    .map((h) => `${h.role}: ${h.content}`)
    .join("\n");

  return `You are an AI assistant that answers questions about a specific GitHub repository.
Use ONLY the provided code context to answer. If the answer is not in the context, say so honestly.

## Relevant code from the repository:
${context}

## Conversation so far:
${historyText}

## Question:
${question}

Answer clearly and concisely, referencing file paths where relevant.`;
}

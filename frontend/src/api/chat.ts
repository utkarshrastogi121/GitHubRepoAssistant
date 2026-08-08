// API calls for the RAG chat feature: index / message / history.

import { apiClient } from "./client";
import { ChatMessage, ChatResponse, IndexResponse } from "@/types";

export async function indexRepo(repoId: string): Promise<IndexResponse> {
  const { data } = await apiClient.post<IndexResponse>(`/chat/${repoId}/index`);
  return data;
}

export async function sendMessage(
  repoId: string,
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(`/chat/${repoId}/message`, {
    message,
    sessionId,
  });
  return data;
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const { data } = await apiClient.get<ChatMessage[]>(`/chat/history/${sessionId}`);
  return data;
}

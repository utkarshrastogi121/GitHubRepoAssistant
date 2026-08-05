// Thin wrapper around the vector store query - kept separate from
// vectorstore.service.ts so RAG-specific logic (like re-ranking, if we
// ever add it) has an obvious home distinct from raw storage operations.

import { queryTopChunks } from "../services/vectorstore.service";
import { RetrievedChunk } from "../types";

export async function retrieveRelevantChunks(
  repoId: string,
  question: string
): Promise<RetrievedChunk[]> {
  return queryTopChunks(repoId, question, 5);
}

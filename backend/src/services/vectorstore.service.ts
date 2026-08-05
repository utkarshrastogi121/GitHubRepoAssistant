
import { CloudClient, Collection } from "chromadb";
import { env } from "../config/env";
import { EmbeddedChunk } from "./embedding.service";
import { RetrievedChunk } from "../types";
import { embedText } from "../llm/gemini-client";

const client = new CloudClient({
  apiKey: env.CHROMA_API_KEY,
  tenant: env.CHROMA_TENANT,
  database: env.CHROMA_DATABASE,
});

function collectionName(repoId: string): string {
  return `repo_${repoId}`;
}

const noopEmbeddingFunction = {
  generate: async (_texts: string[]): Promise<number[][]> => {
    throw new Error(
      "embeddingFunction should not be called - embeddings are always provided explicitly"
    );
  },
};

export async function resetCollection(repoId: string): Promise<Collection> {
  const name = collectionName(repoId);

  try {
    await client.deleteCollection({ name });
  } catch {
    
    
  }

  return client.createCollection({ name, embeddingFunction: noopEmbeddingFunction });
}

const ADD_BATCH_SIZE = 100; // items per Chroma .add() call

export async function storeChunks(repoId: string, chunks: EmbeddedChunk[]): Promise<void> {
  const collection = await resetCollection(repoId);

  for (let i = 0; i < chunks.length; i += ADD_BATCH_SIZE) {
    const batch = chunks.slice(i, i + ADD_BATCH_SIZE);

    await collection.add({
      ids: batch.map((_, idx) => `${repoId}-${i + idx}`),
      embeddings: batch.map((c) => c.embedding),
      documents: batch.map((c) => c.content),
      metadatas: batch.map((c) => ({ filePath: c.filePath, language: c.language })),
    });
  }
}

export async function queryTopChunks(
  repoId: string,
  question: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const collection = await client.getCollection({
    name: collectionName(repoId),
    embeddingFunction: noopEmbeddingFunction,
  });
  const queryEmbedding = await embedText(question);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  const documents = results.documents?.[0] ?? [];
  const metadatas = results.metadatas?.[0] ?? [];
  const distances = results.distances?.[0] ?? [];

  return documents.map((doc: string | null, i: number) => ({
    content: doc ?? "",
    filePath: (metadatas[i]?.filePath as string) ?? "unknown",
    language: (metadatas[i]?.language as string) ?? "",
    score: distances[i] ?? 0,
  }));
}

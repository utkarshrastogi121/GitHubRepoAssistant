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

// We always pass embeddings explicitly (generated via Gemini), so Chroma
// never needs to embed text itself. This no-op satisfies Chroma's type
// requirement for an embeddingFunction without ever actually being called.
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

  return client.createCollection({
    name,
    embeddingFunction: noopEmbeddingFunction,
    metadata: { "hnsw:space": "cosine" },
  });
}


export async function addEmbeddedBatch(
  collection: Collection,
  repoId: string,
  startIndex: number,
  batch: EmbeddedChunk[]
): Promise<void> {
  await collection.add({
    ids: batch.map((_, idx) => `${repoId}-${startIndex + idx}`),
    embeddings: batch.map((c) => c.embedding),
    documents: batch.map((c) => c.content),
    metadatas: batch.map((c) => ({ filePath: c.filePath, language: c.language })),
  });
}

const ADD_BATCH_SIZE = 100; // items per Chroma .add() call

export async function storeChunks(repoId: string, chunks: EmbeddedChunk[]): Promise<void> {
  const collection = await resetCollection(repoId);

  for (let i = 0; i < chunks.length; i += ADD_BATCH_SIZE) {
    await addEmbeddedBatch(collection, repoId, i, chunks.slice(i, i + ADD_BATCH_SIZE));
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

export async function deleteCollectionForRepo(repoId: string): Promise<void> {
  try {
    await client.deleteCollection({ name: collectionName(repoId) });
  } catch {

  }
}

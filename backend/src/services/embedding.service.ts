import { CodeChunk } from "../types";
import { embedTexts } from "../llm/gemini-client";
import { logger } from "../utils/logger";

export interface EmbeddedChunk extends CodeChunk {
  embedding: number[];
}

const BATCH_SIZE = 100; 
const DELAY_BETWEEN_BATCHES_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function embedChunks(chunks: CodeChunk[]): Promise<EmbeddedChunk[]> {
  const embedded: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    logger.info(`Embedding chunks ${i + 1}-${i + batch.length} of ${chunks.length}`);

    const vectors = await embedTexts(batch.map((c) => c.content));

    batch.forEach((chunk, idx) => {
      embedded.push({ ...chunk, embedding: vectors[idx] });
    });

    if (i + BATCH_SIZE < chunks.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return embedded;
}

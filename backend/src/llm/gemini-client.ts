import { genAI, GEMINI_MODEL, GEMINI_EMBEDDING_MODEL } from "../config/gemini";
import { logger } from "../utils/logger";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000; // doubles each retry: 2s, 4s, 8s, 16s, 32s

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
}

// Retries a Gemini API call with exponential backoff when we hit a 429
// (rate limit / quota exceeded). This is especially important on free-tier
// API keys, which have low requests-per-minute limits.
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimitError(err) || attempt >= MAX_RETRIES) throw err;

      const delay = BASE_DELAY_MS * 2 ** attempt;
      logger.warn(`Gemini rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      attempt++;
    }
  }
}

export async function generateText(prompt: string): Promise<string> {
  return withRetry(async () => {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text ?? "";
  });
}

// Embeds a single piece of text (used for chat questions - one call per message).
export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

// Embeds many texts in ONE API call instead of one call per text.
// This is the key fix for rate-limit issues when indexing a repository -
// hundreds of individual embedContent calls will blow through free-tier
// quotas almost instantly, while batching cuts that down drastically.
//
// outputDimensionality is capped at 768 (Google's docs say 768/1536/3072 are
// all "highest quality" options) - the default of 3072 makes each vector 4x
// larger, which was overloading Chroma's request payload size for repos
// with hundreds of chunks.
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  return withRetry(async () => {
    const response = await genAI.models.embedContent({
      model: GEMINI_EMBEDDING_MODEL,
      contents: texts,
      config: { outputDimensionality: 768 },
    });

    const embeddings = response.embeddings?.map((e) => e.values);
    if (!embeddings || embeddings.some((v) => !v)) {
      throw new Error("Failed to generate one or more embeddings");
    }

    return embeddings as number[][];
  });
}

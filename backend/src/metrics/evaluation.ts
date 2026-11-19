import { PerQuestionResult } from "./types";

export function recallAtK(
  expectedFiles: string[],
  retrievedFiles: string[],
  k: number
): number {
  if (expectedFiles.length === 0) return 0;
  const top = new Set(retrievedFiles.slice(0, k));
  const found = expectedFiles.filter((f) => top.has(f)).length;
  return found / expectedFiles.length;
}

export function reciprocalRank(
  expectedFiles: string[],
  retrievedFiles: string[]
): number {
  const expected = new Set(expectedFiles);
  for (let i = 0; i < retrievedFiles.length; i++) {
    if (expected.has(retrievedFiles[i]!)) return 1 / (i + 1);
  }
  return 0;
}

export function scoreQuestion(
  question: string,
  expectedFiles: string[],
  retrievedFiles: string[],
  retrievalMs: number
): PerQuestionResult {
  const rr = reciprocalRank(expectedFiles, retrievedFiles);
  return {
    question,
    expectedFiles,
    retrievedFiles,
    recallAt5: recallAtK(expectedFiles, retrievedFiles, 5),
    recallAt10: recallAtK(expectedFiles, retrievedFiles, 10),
    reciprocalRank: rr,
    hit: rr > 0,
    retrievalMs,
  };
}

export function summarise(
  mode: "VECTOR_ONLY" | "GRAPH_AWARE",
  perQuestion: PerQuestionResult[]
): {
  mode: "VECTOR_ONLY" | "GRAPH_AWARE";
  questions: number;
  recallAt5: number;
  recallAt10: number;
  mrr: number;
  hitRate: number;
  avgRetrievalMs: number;
  perQuestion: PerQuestionResult[];
} {
  const n = perQuestion.length;
  const avg = (xs: number[]) =>
    n === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / n;
  return {
    mode,
    questions: n,
    recallAt5: avg(perQuestion.map((p) => p.recallAt5)),
    recallAt10: avg(perQuestion.map((p) => p.recallAt10)),
    mrr: avg(perQuestion.map((p) => p.reciprocalRank)),
    hitRate: avg(perQuestion.map((p) => (p.hit ? 1 : 0))),
    avgRetrievalMs: avg(perQuestion.map((p) => p.retrievalMs)),
    perQuestion,
  };
}

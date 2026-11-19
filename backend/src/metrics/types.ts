
export interface RetrievalMetrics {
  /** Vector search only. */
  vectorMs: number;
  graphLoadMs: number;
  graphExpandMs: number;
  neighbourFetchMs: number;
  totalRetrievalMs: number;
  seeds: number;
  seedFiles: number;
  expandedFiles: number;
  expandedChunks: number;
  finalChunks: number;
  graphUsed: boolean;
  maxHops: number;
}

export interface QueryMetrics extends RetrievalMetrics {
  llmMs: number;
  totalMs: number;
}

export interface IndexMetrics {
  filesParsed: number;
  chunksIndexed: number;
  graphNodes: number;
  graphEdges: number;
  cloneMs: number;
  parseMs: number;
  graphMs: number;
  embedMs: number;
  storeMs: number;
  totalMs: number;
}

export interface EvaluationQuestion {
  question: string;
  /** Files that must appear in the retrieved set for a hit. */
  expectedFiles: string[];
}

export interface PerQuestionResult {
  question: string;
  expectedFiles: string[];
  retrievedFiles: string[];
  recallAt5: number;
  recallAt10: number;
  reciprocalRank: number;
  hit: boolean;
  retrievalMs: number;
}

export interface EvaluationSummary {
  mode: "VECTOR_ONLY" | "GRAPH_AWARE";
  questions: number;
  recallAt5: number;
  recallAt10: number;
  mrr: number;
  hitRate: number;
  avgRetrievalMs: number;
  perQuestion: PerQuestionResult[];
}

export interface EvaluationComparison {
  vectorOnly: EvaluationSummary;
  graphAware: EvaluationSummary;
}

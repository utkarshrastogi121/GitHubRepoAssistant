// Types mirroring the backend's API response shapes.
// Kept as one shared file since these are genuinely used across many
// components/pages, same philosophy as the backend's types/index.ts.

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

export interface Repository {
  id: string;
  githubUrl: string;
  owner: string;
  name: string;
  language: string | null;
  framework: string | null;
  fileTree: FileTreeNode[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface RetrievalMetrics {
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

export interface ChatResponse {
  sessionId: string;
  answer: string;
  sources: string[];
  metrics?: QueryMetrics;
}

export interface IndexResponse extends IndexMetrics {}

export interface MetricsSummary {
  queryCount: number;
  avgRetrievalMs: number | null;
  avgLlmMs: number | null;
  avgTotalMs: number | null;
  recent: {
    id: string;
    question: string;
    retrievalMs: number;
    llmMs: number;
    totalMs: number;
    seeds: number;
    expandedFiles: number;
    finalChunks: number;
    graphUsed: boolean;
    createdAt: string;
  }[];
  latestIndex: {
    filesParsed: number;
    chunksIndexed: number;
    graphNodes: number;
    graphEdges: number;
    totalMs: number;
    createdAt: string;
  } | null;
}

export interface EvaluationSummary {
  mode: "VECTOR_ONLY" | "GRAPH_AWARE";
  questions: number;
  recallAt5: number;
  recallAt10: number;
  mrr: number;
  hitRate: number;
  avgRetrievalMs: number;
}

export interface EvaluationComparison {
  vectorOnly: EvaluationSummary;
  graphAware: EvaluationSummary;
}

export interface ReadmeResponse {
  markdown: string;
}

export interface DiagramResponse {
  mermaid: string;
}

export interface ReviewResponse {
  markdown: string;
}

export type ReviewType = "bugs" | "code-smells" | "suggestions" | "explain-api" | "explain-logic";

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[] | undefined>;
}

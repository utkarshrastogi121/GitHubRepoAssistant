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

export interface ChatResponse {
  sessionId: string;
  answer: string;
  sources: string[];
}

export interface IndexResponse {
  chunksIndexed: number;
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

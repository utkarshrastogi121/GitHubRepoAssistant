export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

export interface RepoAnalysisResult {
  owner: string;
  name: string;
  githubUrl: string;
  language: string | null;
  framework: string | null;
  fileTree: FileTreeNode[];
}

export interface CodeChunk {
  filePath: string;
  content: string;
  language: string;
  /** Stable id from Chroma (`<repoId>-<index>`), set after storage. */
  chunkId?: string;
  /** Top-level symbols whose name appears in this chunk. */
  symbols?: string[];
}

export interface RetrievedChunk extends CodeChunk {
  /** Chroma cosine distance (lower = more similar). */
  score: number;
  /** Graph fields - only set for chunks pulled in via the code graph. */
  graphHops?: number;
  graphScore?: number;
  /** e.g. `rag.service.ts --IMPORTS--> vectorstore.service.ts` */
  via?: string;
  /** True when this chunk came from vector search, not expansion. */
  isSeed?: boolean;
}


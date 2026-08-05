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
}

export interface RetrievedChunk extends CodeChunk {
  score: number;
}



export type GraphNodeKind =
  | "FILE"
  | "FUNCTION"
  | "CLASS"
  | "INTERFACE"
  | "CONSTANT";

export type GraphEdgeType =
  | "IMPORTS"
  | "CALLS"
  | "DEFINED_IN"
  | "EXTENDS";

export interface GraphNode {
  /** `file:<path>` or `symbol:<path>#<name>` - stable across re-indexes. */
  id: string;
  kind: GraphNodeKind;
  name: string;
  filePath: string;
  symbol?: string | null;
  line?: number | null;
}

export interface GraphEdge {
  fromId: string;
  toId: string;
  type: GraphEdgeType;
}

export interface CodeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** File a graph node belongs to, for file-level expansion. */
export function nodeFilePath(node: GraphNode): string {
  return node.filePath;
}

export function fileNodeId(filePath: string): string {
  return `file:${filePath}`;
}

export function symbolNodeId(filePath: string, symbol: string): string {
  return `symbol:${filePath}#${symbol}`;
}

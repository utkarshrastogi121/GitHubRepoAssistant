import { CodeGraph } from "./types";

export interface ExpandedFile {
  filePath: string;
  hops: number;
  /** e.g. `rag.service.ts --IMPORTS--> vectorstore.service.ts` */
  via: string;
  /** 1.0 at hop 0, 0.5 at hop 1, 0.25 at hop 2. */
  graphScore: number;
}

export interface ExpandOptions {
  maxNeighboursPerSeed?: number;
  maxExpandedFiles?: number;
}

const EDGE_WEIGHT: Record<string, number> = {
  CALLS: 1.0,
  IMPORTS: 0.9,
  DEFINED_IN: 0.8,
  EXTENDS: 0.9,
};

/** File a node id belongs to: `file:x` -> x, `symbol:x#y` -> x. */
function fileOfNodeId(nodeId: string, graph: CodeGraph): string | null {
  if (nodeId.startsWith("file:")) return nodeId.slice("file:".length);
  if (nodeId.startsWith("symbol:")) {
    const rest = nodeId.slice("symbol:".length);
    return rest.split("#")[0] ?? null;
  }
  const node = graph.nodes.find((n) => n.id === nodeId);
  return node ? node.filePath : null;
}

export function expandFromSeeds(
  graph: CodeGraph,
  seedFilePaths: string[],
  options: ExpandOptions = {}
): ExpandedFile[] {
  const maxPerSeed = options.maxNeighboursPerSeed ?? 8;
  const maxTotal = options.maxExpandedFiles ?? 20;

  // File-level adjacency: file -> [{ file, type, via }]
  const adjacency = new Map<
    string,
    { file: string; type: string; via: string }[]
  >();
  for (const edge of graph.edges) {
    const fromFile = fileOfNodeId(edge.fromId, graph);
    const toFile = fileOfNodeId(edge.toId, graph);
    if (!fromFile || !toFile || fromFile === toFile) continue;
    const list = adjacency.get(fromFile) ?? [];
    const via = `${fromFile} --${edge.type}--> ${toFile}`;
    if (!list.some((l) => l.file === toFile && l.type === edge.type)) {
      list.push({ file: toFile, type: edge.type, via });
    }
    adjacency.set(fromFile, list);
  }

  const visited = new Set<string>(seedFilePaths);
  const result: ExpandedFile[] = [];
  // BFS queue: [file, hops, via, weight]
  const queue: { file: string; hops: number; via: string; weight: number }[] =
    seedFilePaths.map((f) => ({ file: f, hops: 0, via: "seed", weight: 1 }));

  while (queue.length > 0 && result.length < maxTotal) {
    const current = queue.shift()!;
    if (current.hops >= 2) continue;

    const neighbours = (adjacency.get(current.file) ?? [])
      // Hop 2: IMPORTS only.
      .filter((n) => current.hops === 0 || n.type === "IMPORTS")
      .slice(0, maxPerSeed);

    for (const n of neighbours) {
      if (visited.has(n.file)) continue;
      visited.add(n.file);
      const hops = current.hops + 1;
      const weight = (EDGE_WEIGHT[n.type] ?? 0.5) * current.weight;
      result.push({
        filePath: n.file,
        hops,
        via: n.via,
        graphScore: weight / (hops + 1),
      });
      queue.push({ file: n.file, hops, via: n.via, weight });
      if (result.length >= maxTotal) break;
    }
  }

  return result;
}

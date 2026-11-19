import { getChunksByFiles, queryTopChunks } from "../services/vectorstore.service";
import { loadCodeGraph } from "../graph/graph-store";
import { expandFromSeeds } from "../graph/graph-expander";
import { RetrievedChunk } from "../types";
import { RetrievalMetrics } from "../metrics/types";

const SEED_TOP_K = 10;
const MAX_CHUNKS = 12;
const CHUNKS_PER_EXPANDED_FILE = 2;

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  metrics: RetrievalMetrics;
}

function rerank(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const byId = new Map<string, RetrievedChunk>();
  for (const c of chunks) {
    const key = c.chunkId ?? `${c.filePath}::${c.content.slice(0, 80)}`;
    if (!byId.has(key)) byId.set(key, c);
  }
  const deduped = [...byId.values()];
  const combined = (c: RetrievedChunk) => {
    const vectorScore = Math.max(0, 1 - Math.min(c.score, 1));
    return 0.7 * vectorScore + 0.3 * (c.graphScore ?? 0);
  };
  return deduped
    .sort((a, b) => combined(b) - combined(a))
    .slice(0, MAX_CHUNKS);
}

function emptyMetrics(): RetrievalMetrics {
  return {
    vectorMs: 0,
    graphLoadMs: 0,
    graphExpandMs: 0,
    neighbourFetchMs: 0,
    totalRetrievalMs: 0,
    seeds: 0,
    seedFiles: 0,
    expandedFiles: 0,
    expandedChunks: 0,
    finalChunks: 0,
    graphUsed: false,
    maxHops: 0,
  };
}

export async function retrieveVectorOnly(
  repoId: string,
  question: string
): Promise<RetrievalResult> {
  const started = Date.now();
  const seeds = await queryTopChunks(repoId, question, SEED_TOP_K);
  const metrics = emptyMetrics();
  metrics.vectorMs = Date.now() - started;
  metrics.totalRetrievalMs = metrics.vectorMs;
  metrics.seeds = seeds.length;
  metrics.seedFiles = new Set(seeds.map((s) => s.filePath)).size;
  metrics.finalChunks = seeds.length;
  return { chunks: rerank(seeds), metrics };
}

export async function retrieveRelevantChunks(
  repoId: string,
  question: string
): Promise<RetrievalResult> {
  const started = Date.now();
  const metrics = emptyMetrics();

  const vectorStarted = Date.now();
  const seeds = await queryTopChunks(repoId, question, SEED_TOP_K);
  metrics.vectorMs = Date.now() - vectorStarted;
  metrics.seeds = seeds.length;
  metrics.seedFiles = new Set(seeds.map((s) => s.filePath)).size;
  if (seeds.length === 0) {
    metrics.totalRetrievalMs = Date.now() - started;
    return { chunks: [], metrics };
  }

  try {
    const loadStarted = Date.now();
    const graph = await loadCodeGraph(repoId);
    metrics.graphLoadMs = Date.now() - loadStarted;
    if (graph.nodes.length === 0) {
      metrics.totalRetrievalMs = Date.now() - started;
      const chunks = rerank(seeds);
      metrics.finalChunks = chunks.length;
      return { chunks, metrics };
    }

    const expandStarted = Date.now();
    const seedFiles = [...new Set(seeds.map((s) => s.filePath))];
    const expanded = expandFromSeeds(graph, seedFiles);
    metrics.graphExpandMs = Date.now() - expandStarted;
    metrics.expandedFiles = expanded.length;
    metrics.maxHops = expanded.reduce((m, e) => Math.max(m, e.hops), 0);
    if (expanded.length === 0) {
      metrics.totalRetrievalMs = Date.now() - started;
      const chunks = rerank(seeds);
      metrics.finalChunks = chunks.length;
      return { chunks, metrics };
    }

    const fetchStarted = Date.now();
    const neighbours = await getChunksByFiles(
      repoId,
      expanded.map((e) => e.filePath),
      CHUNKS_PER_EXPANDED_FILE
    );
    metrics.neighbourFetchMs = Date.now() - fetchStarted;
    metrics.expandedChunks = neighbours.length;
    metrics.graphUsed = true;

    const byFile = new Map(expanded.map((e) => [e.filePath, e]));
    for (const n of neighbours) {
      const exp = byFile.get(n.filePath);
      if (exp) {
        n.graphHops = exp.hops;
        n.graphScore = exp.graphScore;
        n.via = exp.via;
      }
    }
    const chunks = rerank([...seeds, ...neighbours]);
    metrics.finalChunks = chunks.length;
    metrics.totalRetrievalMs = Date.now() - started;
    return { chunks, metrics };
  } catch (err) {
    // Graph is an enhancement, never a hard dependency.
    console.warn(`Graph expansion failed, falling back to seeds: ${err}`);
    metrics.totalRetrievalMs = Date.now() - started;
    const chunks = rerank(seeds);
    metrics.finalChunks = chunks.length;
    return { chunks, metrics };
  }
}

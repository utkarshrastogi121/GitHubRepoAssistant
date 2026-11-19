import { prisma } from "../config/db";
import { cloneRepository, cleanupClonedRepo } from "../github/clone";
import { parseRepository } from "./parser.service";
import { chunkRepository } from "./chunking.service";
import { embedChunks } from "./embedding.service";
import { storeChunks, hasChunks } from "./vectorstore.service";
import { retrieveRelevantChunks } from "../rag/retriever";
import { buildRagPrompt } from "../rag/prompt-builder";
import { generateText } from "../llm/gemini-client";
import { getRepoById } from "./repo.service";
import { buildCodeGraph } from "../graph/graph-builder";
import { saveCodeGraph, hasCodeGraph } from "../graph/graph-store";
import { fetchLatestCommitSha } from "../github/github-api";
import { IndexMetrics, QueryMetrics } from "../metrics/types";

// Chunk + embed + store the repo's code in ChromaDB, and build its
// code graph in Postgres. Run once per repo before chatting (or
// again to re-index after changes). Every stage is timed and the
// run is persisted (IndexRun) so the Repo page can show real
// indexing metrics instead of a one-off console log.
export async function indexRepository(
  repoId: string,
  options?: { force?: boolean }
): Promise<IndexMetrics> {
  const repo = await getRepoById(repoId);

  // Cheap pre-check: one GitHub API call, no clone, no embedding.
  // Null means "unknown" (network / rate limit / no commits) - never
  // treat that as unchanged, fall through to a full index.
  const latestSha = await fetchLatestCommitSha(repo.owner, repo.name);

  if (
    !options?.force &&
    latestSha &&
    repo.lastIndexedCommitSha === latestSha
  ) {
    // SHA matches, but only skip when the previous index actually
    // finished: the graph is saved before embedding, so a 429
    // mid-index leaves a graph with no vectors behind.
    const [graphOk, chunksOk] = await Promise.all([
      hasCodeGraph(repoId),
      hasChunks(repoId),
    ]);
    if (graphOk && chunksOk) {
      const lastRun = await prisma.indexRun.findFirst({
        where: { repositoryId: repoId },
        orderBy: { createdAt: "desc" },
      });
      if (lastRun) {
        return {
          filesParsed: lastRun.filesParsed,
          chunksIndexed: lastRun.chunksIndexed,
          graphNodes: lastRun.graphNodes,
          graphEdges: lastRun.graphEdges,
          cloneMs: 0,
          parseMs: 0,
          graphMs: 0,
          embedMs: 0,
          storeMs: 0,
          totalMs: lastRun.totalMs,
          skipped: true,
          commitSha: latestSha,
        };
      }
    }
  }

  const started = Date.now();
  const metrics: IndexMetrics = {
    filesParsed: 0,
    chunksIndexed: 0,
    graphNodes: 0,
    graphEdges: 0,
    cloneMs: 0,
    parseMs: 0,
    graphMs: 0,
    embedMs: 0,
    storeMs: 0,
    totalMs: 0,
    skipped: false,
    commitSha: latestSha ?? null,
  };

  const cloneStarted = Date.now();
  const { localPath } = await cloneRepository(repo.githubUrl);
  metrics.cloneMs = Date.now() - cloneStarted;

  try {
    const parseStarted = Date.now();
    const files = await parseRepository(localPath);
    metrics.parseMs = Date.now() - parseStarted;
    metrics.filesParsed = files.length;

    // Graph first: it is pure CPU work on the parsed files, and
    // saving it before the (slow, rate-limited) embedding step
    // means a failed embed still leaves a usable graph for the
    // next attempt.
    const graphStarted = Date.now();
    const graph = buildCodeGraph(files);
    const graphStats = await saveCodeGraph(repoId, graph);
    metrics.graphMs = Date.now() - graphStarted;
    metrics.graphNodes = graphStats.nodes;
    metrics.graphEdges = graphStats.edges;

    const chunks = await chunkRepository(files);

    const embedStarted = Date.now();
    const embedded = await embedChunks(chunks);
    metrics.embedMs = Date.now() - embedStarted;
    metrics.chunksIndexed = embedded.length;

    const storeStarted = Date.now();
    await storeChunks(repoId, embedded);
    metrics.storeMs = Date.now() - storeStarted;

    metrics.totalMs = Date.now() - started;
    await prisma.indexRun.create({
      data: {
        repositoryId: repoId,
        filesParsed: metrics.filesParsed,
        chunksIndexed: metrics.chunksIndexed,
        graphNodes: metrics.graphNodes,
        graphEdges: metrics.graphEdges,
        totalMs: metrics.totalMs,
        commitSha: latestSha ?? null,
      },
    });
    if (latestSha) {
      await prisma.repository.update({
        where: { id: repoId },
        data: { lastIndexedCommitSha: latestSha },
      });
    }
    return metrics;
  } finally {
    await cleanupClonedRepo(localPath);
  }
}


export async function getOrCreateSession(repoId: string, sessionId?: string) {
  if (sessionId) {
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (session) return session;
  }

  return prisma.chatSession.create({ data: { repositoryId: repoId } });
}

export async function askQuestion(repoId: string, sessionId: string, question: string) {
  const started = Date.now();
  const previousMessages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 10, // keep prompt size reasonable
  });

  const { chunks: relevantChunks, metrics: retrieval } =
    await retrieveRelevantChunks(repoId, question);

  const prompt = buildRagPrompt(
    question,
    relevantChunks,
    previousMessages.map((m: { role: "USER" | "ASSISTANT"; content: string }) => ({
      role: m.role,
      content: m.content,
    }))
  );

  const llmStarted = Date.now();
  const answer = await generateText(prompt);
  const llmMs = Date.now() - llmStarted;

  const metrics: QueryMetrics = {
    ...retrieval,
    llmMs,
    totalMs: Date.now() - started,
  };

  await prisma.chatMessage.create({
    data: { sessionId, role: "USER", content: question },
  });
  await prisma.chatMessage.create({
    data: { sessionId, role: "ASSISTANT", content: answer },
  });
  // Persist per-query metrics (best-effort: a metrics write must
  // never fail the chat answer itself).
  try {
    await prisma.queryMetric.create({
      data: {
        repositoryId: repoId,
        sessionId,
        question: question.slice(0, 500),
        retrievalMs: metrics.totalRetrievalMs,
        llmMs: metrics.llmMs,
        totalMs: metrics.totalMs,
        seeds: metrics.seeds,
        expandedFiles: metrics.expandedFiles,
        finalChunks: metrics.finalChunks,
        graphUsed: metrics.graphUsed,
      },
    });
  } catch (err) {
    console.warn(`Failed to save query metrics: ${err}`);
  }

  return {
    answer,
    // Dedupe: several chunks (seed + graph neighbour) can come
    // from the same file.
    sources: [...new Set(relevantChunks.map((c) => c.filePath))],
    metrics,
  };
}

export async function getChatHistory(sessionId: string) {
  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

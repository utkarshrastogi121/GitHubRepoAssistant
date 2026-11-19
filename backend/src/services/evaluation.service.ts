

import { prisma } from "../config/db";
import { retrieveRelevantChunks, retrieveVectorOnly } from "../rag/retriever";
import { scoreQuestion, summarise } from "../metrics/evaluation";
import {
  EvaluationComparison,
  EvaluationQuestion,
  EvaluationSummary,
} from "../metrics/types";
import { getRepoById } from "./repo.service";

const MAX_QUESTIONS = 20;

async function runMode(
  repoId: string,
  questions: EvaluationQuestion[],
  mode: "VECTOR_ONLY" | "GRAPH_AWARE"
): Promise<EvaluationSummary> {
  const perQuestion = [];
  for (const q of questions) {
    const started = Date.now();
    const { chunks } =
      mode === "VECTOR_ONLY"
        ? await retrieveVectorOnly(repoId, q.question)
        : await retrieveRelevantChunks(repoId, q.question);
    // Retrieved files in rank order, deduped, so Recall@k / MRR
    // see the order the LLM would see.
    const retrievedFiles = [...new Set(chunks.map((c) => c.filePath))];
    perQuestion.push(
      scoreQuestion(q.question, q.expectedFiles, retrievedFiles, Date.now() - started)
    );
  }
  return summarise(mode, perQuestion);
}

export async function runEvaluation(
  repoId: string,
  questions: EvaluationQuestion[]
): Promise<EvaluationComparison> {
  await getRepoById(repoId); // throws "Repository not found" if unknown
  if (questions.length === 0 || questions.length > MAX_QUESTIONS) {
    throw new Error(`Provide 1-${MAX_QUESTIONS} questions`);
  }

  const vectorOnly = await runMode(repoId, questions, "VECTOR_ONLY");
  const graphAware = await runMode(repoId, questions, "GRAPH_AWARE");

  for (const summary of [vectorOnly, graphAware]) {
    await prisma.evaluationRun.create({
      data: {
        repositoryId: repoId,
        mode: summary.mode,
        questions: summary.questions,
        recallAt5: summary.recallAt5,
        recallAt10: summary.recallAt10,
        mrr: summary.mrr,
        hitRate: summary.hitRate,
        avgRetrievalMs: summary.avgRetrievalMs,
        result: summary.perQuestion as unknown as object,
      },
    });
  }

  return { vectorOnly, graphAware };
}

export async function getLatestEvaluations(repoId: string) {
  return prisma.evaluationRun.findMany({
    where: { repositoryId: repoId },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

export async function getQueryMetricsSummary(repoId: string) {
  const [recent, aggregates] = await Promise.all([
    prisma.queryMetric.findMany({
      where: { repositoryId: repoId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.queryMetric.aggregate({
      where: { repositoryId: repoId },
      _avg: { retrievalMs: true, llmMs: true, totalMs: true },
      _count: { id: true },
    }),
  ]);
  const latestIndex = await prisma.indexRun.findFirst({
    where: { repositoryId: repoId },
    orderBy: { createdAt: "desc" },
  });
  return {
    queryCount: aggregates._count.id,
    avgRetrievalMs: aggregates._avg.retrievalMs,
    avgLlmMs: aggregates._avg.llmMs,
    avgTotalMs: aggregates._avg.totalMs,
    recent,
    latestIndex,
  };
}

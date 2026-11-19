// Repository detail page: shows the file tree and links to the AI features
// (chat, docs, review) for this specific repo. Matches GET /repos/:id.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { RepoSummary } from "@/components/repo/RepoSummary";
import { FileTreeView } from "@/components/repo/FileTreeView";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { getRepo } from "@/api/repos";
import { getMetricsSummary, runEvaluation } from "@/api/metrics";
import { EvaluationComparison, MetricsSummary, Repository } from "@/types";
import { MetricsCard, formatMs, formatPct } from "@/components/metrics/MetricsCard";
import { Button } from "@/components/common/Button";
import { useRepo } from "@/contexts/RepoContext";

export default function RepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationComparison | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { setActiveRepo } = useRepo();

  async function loadMetrics(repoId: string) {
    try {
      setMetrics(await getMetricsSummary(repoId));
    } catch {
      // Metrics are best-effort: a repo indexed before this
      // feature simply has no rows yet.
      setMetrics(null);
    }
  }

  async function handleEvaluate() {
    if (!id) return;
    setIsEvaluating(true);
    setError(null);
    try {
      setEvaluation(await runEvaluation(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  }

  async function load() {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRepo(id);
      setRepo(data);
      setActiveRepo(data);
      loadMetrics(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repository");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer title="Repository">
        <Spinner label="Loading repository..." />
      </PageContainer>
    );
  }

  if (error || !repo) {
    return (
      <PageContainer title="Repository">
        <ErrorBanner message={error ?? "Repository not found"} onRetry={load} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Repository Details">
      <div className="flex flex-col gap-6">
        <RepoSummary repo={repo} />

        <div className="flex gap-3">
          <Link
            to="/chat"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Chat with this repo
          </Link>
          <Link
            to="/docs"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Generate docs
          </Link>
          <Link
            to="/review"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Run code review
          </Link>
        </div>

        {metrics?.latestIndex && (
          <MetricsCard
            title="Last index run"
            stats={[
              { label: "Files parsed", value: String(metrics.latestIndex.filesParsed) },
              { label: "Chunks indexed", value: String(metrics.latestIndex.chunksIndexed) },
              { label: "Graph nodes", value: String(metrics.latestIndex.graphNodes) },
              { label: "Graph edges", value: String(metrics.latestIndex.graphEdges) },
              { label: "Index time", value: formatMs(metrics.latestIndex.totalMs) },
              {
                label: "Queries so far",
                value: `${metrics.queryCount} (avg ${formatMs(metrics.avgTotalMs)} / query)`,
              },
            ]}
          />
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Retrieval evaluation</h3>
          <p className="mb-3 text-sm text-gray-500">
            Runs 5 labelled cross-file questions through vector-only and graph-aware
            retrieval and compares Recall@5, MRR and hit rate. No numbers are shown
            until a run completes.
          </p>
          <Button onClick={handleEvaluate} isLoading={isEvaluating}>
            Run evaluation
          </Button>
          {evaluation && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricsCard
                title={`Vector-only (${evaluation.vectorOnly.questions} questions)`}
                stats={[
                  { label: "Recall@5", value: formatPct(evaluation.vectorOnly.recallAt5) },
                  { label: "Recall@10", value: formatPct(evaluation.vectorOnly.recallAt10) },
                  { label: "MRR", value: evaluation.vectorOnly.mrr.toFixed(2) },
                  { label: "Hit rate", value: formatPct(evaluation.vectorOnly.hitRate) },
                  { label: "Avg retrieval", value: formatMs(evaluation.vectorOnly.avgRetrievalMs) },
                ]}
              />
              <MetricsCard
                title={`Graph-aware (${evaluation.graphAware.questions} questions)`}
                stats={[
                  { label: "Recall@5", value: formatPct(evaluation.graphAware.recallAt5) },
                  { label: "Recall@10", value: formatPct(evaluation.graphAware.recallAt10) },
                  { label: "MRR", value: evaluation.graphAware.mrr.toFixed(2) },
                  { label: "Hit rate", value: formatPct(evaluation.graphAware.hitRate) },
                  { label: "Avg retrieval", value: formatMs(evaluation.graphAware.avgRetrievalMs) },
                ]}
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">File Structure</h2>
          <FileTreeView tree={repo.fileTree} />
        </div>
      </div>
    </PageContainer>
  );
}

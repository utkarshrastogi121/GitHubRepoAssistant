import { apiClient } from "./client";
import { EvaluationComparison, MetricsSummary } from "@/types";

export async function getMetricsSummary(repoId: string): Promise<MetricsSummary> {
  const { data } = await apiClient.get<MetricsSummary>(`/metrics/${repoId}/summary`);
  return data;
}

export async function runEvaluation(repoId: string): Promise<EvaluationComparison> {
  // No body = run the built-in starter set (for this repo).
  const { data } = await apiClient.post<EvaluationComparison>(
    `/metrics/${repoId}/evaluate`,
    {}
  );
  return data;
}

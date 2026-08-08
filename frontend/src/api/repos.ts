import { apiClient } from "./client";
import { Repository } from "@/types";

export async function analyzeRepo(githubUrl: string): Promise<Repository> {
  const { data } = await apiClient.post<Repository>("/repos/analyze", { githubUrl });
  return data;
}

export async function listRepos(): Promise<Repository[]> {
  const { data } = await apiClient.get<Repository[]>("/repos");
  return data;
}

export async function getRepo(id: string): Promise<Repository> {
  const { data } = await apiClient.get<Repository>(`/repos/${id}`);
  return data;
}

export async function deleteRepo(id: string): Promise<void> {
  await apiClient.delete(`/repos/${id}`);
}

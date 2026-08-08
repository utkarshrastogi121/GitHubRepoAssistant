// API calls for the Docs feature: README + Mermaid architecture diagram generation.

import { apiClient } from "./client";
import { ReadmeResponse, DiagramResponse } from "@/types";

export async function generateReadme(repoId: string): Promise<ReadmeResponse> {
  const { data } = await apiClient.post<ReadmeResponse>(`/docs/${repoId}/readme`);
  return data;
}

export async function generateArchitectureDiagram(repoId: string): Promise<DiagramResponse> {
  const { data } = await apiClient.post<DiagramResponse>(`/docs/${repoId}/architecture-diagram`);
  return data;
}

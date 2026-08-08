// API calls for the Code Review feature: bugs, code smells, suggestions,
// API explanation, and business logic explanation. All five return the
// same { markdown: string } shape, so one function handles all of them.

import { apiClient } from "./client";
import { ReviewResponse, ReviewType } from "@/types";

export async function runReview(repoId: string, type: ReviewType): Promise<ReviewResponse> {
  const { data } = await apiClient.post<ReviewResponse>(`/review/${repoId}/${type}`);
  return data;
}

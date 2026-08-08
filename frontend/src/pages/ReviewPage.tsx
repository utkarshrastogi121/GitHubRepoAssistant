// Code review page: bugs, code smells, suggestions, API explanation,
// business logic explanation. Matches POST /review/:repoId/{type}.
// All five endpoints return the same { markdown: string } shape.

import { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { ReviewResultCard } from "@/components/review/ReviewResultCard";
import { useRepo } from "@/contexts/RepoContext";
import { runReview } from "@/api/review";
import { ReviewType } from "@/types";

const REVIEW_OPTIONS: { type: ReviewType; label: string }[] = [
  { type: "bugs", label: "Detect Bugs" },
  { type: "code-smells", label: "Detect Code Smells" },
  { type: "suggestions", label: "Suggest Improvements" },
  { type: "explain-api", label: "Explain APIs" },
  { type: "explain-logic", label: "Explain Business Logic" },
];

export default function ReviewPage() {
  const { activeRepo } = useRepo();
  const [loadingType, setLoadingType] = useState<ReviewType | null>(null);
  const [results, setResults] = useState<Partial<Record<ReviewType, string>>>({});
  const [error, setError] = useState<string | null>(null);

  if (!activeRepo) {
    return (
      <PageContainer title="Review">
        <ErrorBanner message="No repository selected. Analyze or select a repository first." />
        <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Go to Repositories
        </Link>
      </PageContainer>
    );
  }

  async function handleRun(type: ReviewType) {
    setLoadingType(type);
    setError(null);
    try {
      const result = await runReview(activeRepo!.id, type);
      setResults((prev) => ({ ...prev, [type]: result.markdown }));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to run "${type}"`);
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <PageContainer
      title={`Code Review for ${activeRepo.owner}/${activeRepo.name}`}
      description="Run AI-powered code review checks. Each check analyzes up to 8 source files in a single request."
    >
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        {REVIEW_OPTIONS.map((option) => (
          <Button
            key={option.type}
            variant="secondary"
            onClick={() => handleRun(option.type)}
            isLoading={loadingType === option.type}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {REVIEW_OPTIONS.filter((option) => results[option.type]).map((option) => (
          <ReviewResultCard key={option.type} title={option.label} markdown={results[option.type]!} />
        ))}
      </div>
    </PageContainer>
  );
}

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
import { Repository } from "@/types";
import { useRepo } from "@/contexts/RepoContext";

export default function RepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setActiveRepo } = useRepo();

  async function load() {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRepo(id);
      setRepo(data);
      setActiveRepo(data);
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

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">File Structure</h2>
          <FileTreeView tree={repo.fileTree} />
        </div>
      </div>
    </PageContainer>
  );
}

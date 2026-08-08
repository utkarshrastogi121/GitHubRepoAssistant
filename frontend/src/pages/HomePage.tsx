import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AnalyzeForm } from "@/components/repo/AnalyzeForm";
import { RepoCard } from "@/components/repo/RepoCard";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { analyzeRepo, listRepos, deleteRepo } from "@/api/repos";
import { Repository } from "@/types";
import { useRepo } from "@/contexts/RepoContext";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeRepo, setActiveRepo } = useRepo();
  const navigate = useNavigate();

  async function loadRepos() {
    setIsLoadingList(true);
    setError(null);
    try {
      const data = await listRepos();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories");
    } finally {
      setIsLoadingList(false);
    }
  }

  useEffect(() => {
    loadRepos();
  }, []);

  async function handleAnalyze(githubUrl: string) {
    setIsAnalyzing(true);
    setError(null);
    try {
      const repo = await analyzeRepo(githubUrl);
      setActiveRepo(repo);
      navigate(`/repos/${repo.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze repository");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleDelete(repoId: string) {
    setError(null);
    try {
      await deleteRepo(repoId);
      setRepos((prev) => prev.filter((repo) => repo.id !== repoId));
      if (activeRepo?.id === repoId) setActiveRepo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete repository");
    }
  }

  return (
    <PageContainer
      title="Analyze a GitHub Repository"
      description="Paste any public GitHub repository URL to clone, parse, and analyze it with AI."
    >
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-5">
        <AnalyzeForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onRetry={loadRepos} />
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold text-gray-500">Previously Analyzed</h2>

      {isLoadingList ? (
        <Spinner label="Loading repositories..." />
      ) : repos.length === 0 ? (
        <p className="text-sm text-gray-500">No repositories analyzed yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onSelect={setActiveRepo} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

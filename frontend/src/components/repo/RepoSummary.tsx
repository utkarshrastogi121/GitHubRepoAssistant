import { Repository } from "@/types";

interface RepoSummaryProps {
  repo: Repository;
}

export function RepoSummary({ repo }: RepoSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {repo.owner}/{repo.name}
          </h2>
          <a
            href={repo.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline"
          >
            {repo.githubUrl}
          </a>
        </div>
        <div className="flex gap-2">
          {repo.language && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {repo.language}
            </span>
          )}
          {repo.framework && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {repo.framework}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Repository } from "@/types";
import { formatDate } from "@/utils/formatDate";

interface RepoCardProps {
  repo: Repository;
  onSelect: (repo: Repository) => void;
}

export function RepoCard({ repo, onSelect }: RepoCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-brand-300">
      <div>
        <p className="font-medium text-gray-900">
          {repo.owner}/{repo.name}
        </p>
        <p className="text-xs text-gray-500">
          {repo.language ?? "Unknown language"} · {repo.framework ?? "No framework detected"} · analyzed{" "}
          {formatDate(repo.createdAt)}
        </p>
      </div>
      <Link
        to={`/repos/${repo.id}`}
        onClick={() => onSelect(repo)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        View
      </Link>
    </div>
  );
}

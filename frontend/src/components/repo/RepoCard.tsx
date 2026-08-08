import { useState } from "react";
import { Link } from "react-router-dom";
import { Repository } from "@/types";
import { formatDate } from "@/utils/formatDate";

interface RepoCardProps {
  repo: Repository;
  onSelect: (repo: Repository) => void;
  onDelete: (repoId: string) => Promise<void> | void;
}

export function RepoCard({ repo, onSelect, onDelete }: RepoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${repo.owner}/${repo.name}? This removes its analysis, chat history, and search index. This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(repo.id);
    } finally {
      setIsDeleting(false);
    }
  }

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
      <div className="flex shrink-0 gap-2">
        <Link
          to={`/repos/${repo.id}`}
          onClick={() => onSelect(repo)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

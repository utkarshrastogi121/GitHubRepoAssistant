// The core "enter a GitHub URL" form - this is the entry point of the whole
// app, matching the backend's POST /repos/analyze endpoint.

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";

interface AnalyzeFormProps {
  onAnalyze: (githubUrl: string) => void;
  isLoading: boolean;
}

export function AnalyzeForm({ onAnalyze, isLoading }: AnalyzeFormProps) {
  const [githubUrl, setGithubUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    onAnalyze(githubUrl.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="url"
        required
        placeholder="https://github.com/owner/repo"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <Button type="submit" isLoading={isLoading}>
        Analyze Repository
      </Button>
    </form>
  );
}

interface GithubRepoMeta {
  language: string | null;
  description: string | null;
  stars: number;
  defaultBranch: string;
}

export async function fetchRepoMetadata(owner: string, name: string): Promise<GithubRepoMeta> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    return { language: null, description: null, stars: 0, defaultBranch: "main" };
  }

  const data = (await response.json()) as any;

  return {
    language: data.language ?? null,
    description: data.description ?? null,
    stars: data.stargazers_count ?? 0,
    defaultBranch: data.default_branch ?? "main",
  };
}

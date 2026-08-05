// Orchestrates the full "analyze repository" flow:
// clone -> parse -> detect framework/language -> build tree -> save to DB.
// This is the main entry point called by repo.controller.ts.

import { prisma } from "../config/db";
import { cloneRepository, cleanupClonedRepo, parseGithubUrl } from "../github/clone";
import { parseRepository } from "./parser.service";
import { buildFileTree } from "./tree.service";
import { detectFrameworkAndLanguage } from "./framework-detector.service";
import { logger } from "../utils/logger";

export async function analyzeRepo(githubUrl: string) {
  const { owner, name } = parseGithubUrl(githubUrl);

  // If already analyzed, return existing record instead of re-cloning
  const existing = await prisma.repository.findUnique({ where: { githubUrl } });
  if (existing) {
    logger.info(`Repository ${githubUrl} already analyzed, returning cached result`);
    return existing;
  }

  const { localPath } = await cloneRepository(githubUrl);

  try {
    const files = await parseRepository(localPath);
    const fileTree = await buildFileTree(localPath);
    const { language, framework } = await detectFrameworkAndLanguage(localPath, files);

    const repository = await prisma.repository.create({
      data: {
        githubUrl,
        owner,
        name,
        language,
        framework,
        fileTree: fileTree as any,
      },
    });

    return repository;
  } finally {
    // Clean up disk space - we don't need the cloned repo after analysis.
    // (For RAG indexing, we clone again in rag.service.ts - see Phase 4 notes.)
    await cleanupClonedRepo(localPath);
  }
}

export async function getRepoById(id: string) {
  const repo = await prisma.repository.findUnique({ where: { id } });
  if (!repo) throw new Error("Repository not found");
  return repo;
}

export async function listRepos() {
  return prisma.repository.findMany({ orderBy: { createdAt: "desc" } });
}

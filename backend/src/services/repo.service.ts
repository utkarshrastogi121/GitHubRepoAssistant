import { prisma } from "../config/db";
import { cloneRepository, cleanupClonedRepo, parseGithubUrl } from "../github/clone";
import { parseRepository } from "./parser.service";
import { buildFileTree } from "./tree.service";
import { detectFrameworkAndLanguage } from "./framework-detector.service";
import { deleteCollectionForRepo } from "./vectorstore.service";
import { logger } from "../utils/logger";

export async function analyzeRepo(githubUrl: string) {
  const { owner, name } = parseGithubUrl(githubUrl);

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

export async function deleteRepo(id: string) {
  await getRepoById(id); // throws "Repository not found" if it doesn't exist

  await deleteCollectionForRepo(id);
  await prisma.repository.delete({ where: { id } });

  logger.info(`Deleted repository ${id}`);
}

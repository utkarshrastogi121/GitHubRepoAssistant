

import simpleGit from "simple-git";
import path from "path";
import fs from "fs/promises";
import { env } from "../config/env";
import { logger } from "../utils/logger";

interface CloneResult {
  localPath: string;
  owner: string;
  name: string;
}

// Extracts "owner/repo" from a GitHub URL like https://github.com/owner/repo(.git)
export function parseGithubUrl(githubUrl: string): { owner: string; name: string } {
  const cleaned = githubUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)$/i);

  if (!match) {
    throw new Error("Invalid GitHub URL. Expected format: https://github.com/owner/repo");
  }

  return { owner: match[1], name: match[2] };
}

export async function cloneRepository(githubUrl: string): Promise<CloneResult> {
  const { owner, name } = parseGithubUrl(githubUrl);

  const baseDir = path.resolve(env.CLONE_TMP_DIR);
  await fs.mkdir(baseDir, { recursive: true });

  const localPath = path.join(baseDir, `${owner}-${name}-${Date.now()}`);

  logger.info(`Cloning ${githubUrl} into ${localPath}`);

  const git = simpleGit();
  await git.clone(githubUrl, localPath, ["--depth", "1"]);

  return { localPath, owner, name };
}

export async function cleanupClonedRepo(localPath: string): Promise<void> {
  try {
    await fs.rm(localPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });

    logger.info(`Cleaned up temporary repository: ${localPath}`);
  } catch (error) {
    logger.warn(
      `Failed to clean up temporary repository: ${localPath}. ${error}`
    );
  }
}

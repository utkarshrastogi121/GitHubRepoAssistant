

import { prisma } from "../config/db";
import { getRepoById } from "./repo.service";
import { buildReadmePrompt } from "../llm/prompts/readme.prompt";
import { generateText } from "../llm/gemini-client";
import { FileTreeNode } from "../types";

export async function generateReadme(repoId: string) {
  const repo = await getRepoById(repoId);

  const prompt = buildReadmePrompt(
    repo.owner,
    repo.name,
    repo.language,
    repo.framework,
    repo.fileTree as unknown as FileTreeNode[]
  );

  const readmeMarkdown = await generateText(prompt);

  await prisma.analysisHistory.create({
    data: { repositoryId: repoId, type: "README", result: { markdown: readmeMarkdown } },
  });

  return { markdown: readmeMarkdown };
}

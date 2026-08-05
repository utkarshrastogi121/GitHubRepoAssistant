
import { prisma } from "../config/db";
import { getRepoById } from "./repo.service";
import { generateText } from "../llm/gemini-client";
import { FileTreeNode } from "../types";

function buildDiagramPrompt(fileTree: FileTreeNode[]): string {
  return `You are a software architect. Based on the following repository file structure,
generate a Mermaid.js flowchart (using "flowchart TD" syntax) that visually represents
the high-level architecture and how folders/modules relate to each other.

File structure (JSON):
${JSON.stringify(fileTree, null, 2)}

Return ONLY the Mermaid code block content (no triple backticks, no explanation),
starting with "flowchart TD".`;
}

export async function generateArchitectureDiagram(repoId: string) {
  const repo = await getRepoById(repoId);
  const prompt = buildDiagramPrompt(repo.fileTree as unknown as FileTreeNode[]);

  const mermaidCode = await generateText(prompt);

  await prisma.analysisHistory.create({
    data: {
      repositoryId: repoId,
      type: "ARCHITECTURE_DIAGRAM",
      result: { mermaid: mermaidCode },
    },
  });

  return { mermaid: mermaidCode };
}

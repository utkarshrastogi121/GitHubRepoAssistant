import { prisma } from "../config/db";
import { getRepoById } from "./repo.service";
import { cloneRepository, cleanupClonedRepo } from "../github/clone";
import { parseRepository, ParsedFile } from "./parser.service";
import { generateText } from "../llm/gemini-client";
import {
  buildBugDetectionPrompt,
  buildCodeSmellPrompt,
  buildSuggestionsPrompt,
  buildApiExplanationPrompt,
  buildLogicExplanationPrompt,
} from "../llm/prompts/review.prompt";

type AnalysisType =
  | "README"
  | "ARCHITECTURE_DIAGRAM"
  | "CODE_REVIEW"
  | "BUG_REPORT"
  | "CODE_SMELLS"
  | "SUGGESTIONS"
  | "API_EXPLANATION"
  | "LOGIC_EXPLANATION";

const MAX_FILES_PER_REVIEW = 8; // keep a single prompt's size reasonable

async function getRepoFiles(githubUrl: string): Promise<ParsedFile[]> {
  const { localPath } = await cloneRepository(githubUrl);
  try {
    return await parseRepository(localPath);
  } finally {
    await cleanupClonedRepo(localPath);
  }
}

function pickMainSourceFiles(files: ParsedFile[]): ParsedFile[] {
  const sourceExtensions = new Set(["ts", "tsx", "js", "jsx", "py", "java", "go"]);
  return files
    .filter((f) => sourceExtensions.has(f.extension))
    .slice(0, MAX_FILES_PER_REVIEW);
}

function toReviewFiles(files: ParsedFile[]) {
  return files.map((f) => ({ filePath: f.relativePath, content: f.content }));
}

async function saveHistory(repositoryId: string, type: AnalysisType, result: object) {
  await prisma.analysisHistory.create({ data: { repositoryId, type, result } });
}

export async function detectBugs(repoId: string) {
  const repo = await getRepoById(repoId);
  const files = pickMainSourceFiles(await getRepoFiles(repo.githubUrl));

  const markdown = await generateText(buildBugDetectionPrompt(toReviewFiles(files)));

  await saveHistory(repoId, "BUG_REPORT", { markdown });
  return { markdown };
}

export async function detectCodeSmells(repoId: string) {
  const repo = await getRepoById(repoId);
  const files = pickMainSourceFiles(await getRepoFiles(repo.githubUrl));

  const markdown = await generateText(buildCodeSmellPrompt(toReviewFiles(files)));

  await saveHistory(repoId, "CODE_SMELLS", { markdown });
  return { markdown };
}

export async function suggestImprovements(repoId: string) {
  const repo = await getRepoById(repoId);
  const files = pickMainSourceFiles(await getRepoFiles(repo.githubUrl));

  const markdown = await generateText(buildSuggestionsPrompt(toReviewFiles(files)));

  await saveHistory(repoId, "SUGGESTIONS", { markdown });
  return { markdown };
}

export async function explainApis(repoId: string) {
  const repo = await getRepoById(repoId);
  const allFiles = await getRepoFiles(repo.githubUrl);

  // Only look at files that look like routes/controllers
  const routeFiles = allFiles
    .filter((f) => /route|controller/i.test(f.relativePath))
    .slice(0, MAX_FILES_PER_REVIEW);

  const markdown = await generateText(buildApiExplanationPrompt(toReviewFiles(routeFiles)));

  await saveHistory(repoId, "API_EXPLANATION", { markdown });
  return { markdown };
}

export async function explainBusinessLogic(repoId: string) {
  const repo = await getRepoById(repoId);
  const files = pickMainSourceFiles(
    (await getRepoFiles(repo.githubUrl)).filter((f) => /service/i.test(f.relativePath))
  );

  const markdown = await generateText(buildLogicExplanationPrompt(toReviewFiles(files)));

  await saveHistory(repoId, "LOGIC_EXPLANATION", { markdown });
  return { markdown };
}

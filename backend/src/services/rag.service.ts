import { prisma } from "../config/db";
import { cloneRepository, cleanupClonedRepo } from "../github/clone";
import { parseRepository } from "./parser.service";
import { chunkRepository } from "./chunking.service";
import { embedChunks } from "./embedding.service";
import { storeChunks } from "./vectorstore.service";
import { retrieveRelevantChunks } from "../rag/retriever";
import { buildRagPrompt } from "../rag/prompt-builder";
import { generateText } from "../llm/gemini-client";
import { getRepoById } from "./repo.service";

// Chunk + embed + store the repo's code in ChromaDB. Run once per repo
// before chatting (or again to re-index after changes).
export async function indexRepository(repoId: string): Promise<{ chunksIndexed: number }> {
  const repo = await getRepoById(repoId);

  const { localPath } = await cloneRepository(repo.githubUrl);

  try {
    const files = await parseRepository(localPath);
    const chunks = await chunkRepository(files);
    const embedded = await embedChunks(chunks);
    await storeChunks(repoId, embedded);

    return { chunksIndexed: embedded.length };
  } finally {
    await cleanupClonedRepo(localPath);
  }
}

export async function getOrCreateSession(repoId: string, sessionId?: string) {
  if (sessionId) {
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (session) return session;
  }

  return prisma.chatSession.create({ data: { repositoryId: repoId } });
}

export async function askQuestion(repoId: string, sessionId: string, question: string) {
  const previousMessages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 10, // keep prompt size reasonable
  });

  const relevantChunks = await retrieveRelevantChunks(repoId, question);

  const prompt = buildRagPrompt(
    question,
    relevantChunks,
    previousMessages.map((m: { role: "USER" | "ASSISTANT"; content: string }) => ({
      role: m.role,
      content: m.content,
    }))
  );

  const answer = await generateText(prompt);

  await prisma.chatMessage.create({
    data: { sessionId, role: "USER", content: question },
  });
  await prisma.chatMessage.create({
    data: { sessionId, role: "ASSISTANT", content: answer },
  });

  return { answer, sources: relevantChunks.map((c) => c.filePath) };
}

export async function getChatHistory(sessionId: string) {
  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

import { CodeChunk } from "../types";
import { ParsedFile } from "./parser.service";
import { splitFileIntoChunks } from "../rag/splitter";

export async function chunkRepository(files: ParsedFile[]): Promise<CodeChunk[]> {
  const allChunks: CodeChunk[] = [];

  for (const file of files) {
    const chunks = await splitFileIntoChunks(file);
    allChunks.push(...chunks);
  }

  return allChunks;
}

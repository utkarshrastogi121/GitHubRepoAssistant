import { CodeChunk } from "../types";
import { ParsedFile } from "./parser.service";
import { splitFileIntoChunks } from "../rag/splitter";
import { extractSymbols } from "../graph/graph-builder";

export async function chunkRepository(files: ParsedFile[]): Promise<CodeChunk[]> {
  const allChunks: CodeChunk[] = [];

  for (const file of files) {
    const chunks = await splitFileIntoChunks(file);
    // Tag each chunk with the symbols it mentions, so a seed chunk
    // can be mapped back to the graph node(s) it came from without
    // re-parsing. Cheap heuristic: symbol name as a whole word.
    const symbolNames = extractSymbols(file).map((s) => s.name);
    for (const chunk of chunks) {
      chunk.symbols = symbolNames.filter((name) =>
        new RegExp(`\\b${name}\\b`).test(chunk.content)
      );
      allChunks.push(chunk);
    }
  }

  return allChunks;
}

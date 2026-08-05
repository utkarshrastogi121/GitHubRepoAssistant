// Splits source file content into overlapping chunks using LangChain's
// RecursiveCharacterTextSplitter. We use LangChain only for this narrow
// utility - not for chains/agents - per project philosophy.

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CodeChunk } from "../types";
import { ParsedFile } from "../services/parser.service";

// Larger chunks = fewer total chunks per repo = fewer Gemini embedding calls,
// which matters a lot on rate-limited (free-tier) API keys. 2000 chars still
// keeps each chunk focused enough to be useful for retrieval.
const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

export async function splitFileIntoChunks(file: ParsedFile): Promise<CodeChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const pieces = await splitter.splitText(file.content);

  return pieces.map((content) => ({
    filePath: file.relativePath,
    content,
    language: file.extension,
  }));
}

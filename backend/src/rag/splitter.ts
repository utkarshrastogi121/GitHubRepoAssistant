import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CodeChunk } from "../types";
import { ParsedFile } from "../services/parser.service";

// Larger chunks = fewer total chunks per repo = fewer Gemini embedding calls
const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

// LangChain's fromLanguage() for language-aware separators splits after functions
const EXPORT_AWARE_JS_SEPARATORS = [
  "\nexport function ",
  "\nexport async function ",
  "\nexport const ",
  "\nexport let ",
  "\nexport class ",
  "\nexport default ",
  "\nexport interface ",
  "\nexport type ",
];

const EXTENSION_TO_LANGUAGE = {
  ts: "js",
  tsx: "js",
  js: "js",
  jsx: "js",
  py: "python",
  java: "java",
  go: "go",
  rb: "ruby",
  rs: "rust",
  php: "php",
  cpp: "cpp",
  c: "cpp",
  h: "cpp",
  hpp: "cpp",
  md: "markdown",
  html: "html",
} as const;

type SupportedExtension = keyof typeof EXTENSION_TO_LANGUAGE;

function isSupportedExtension(extension: string): extension is SupportedExtension {
  return extension in EXTENSION_TO_LANGUAGE;
}

function buildSplitterFor(extension: string): RecursiveCharacterTextSplitter {
  if (!isSupportedExtension(extension)) {
    // fall back to plain generic text splitting.
    return new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });
  }

  const language = EXTENSION_TO_LANGUAGE[extension];

  if (language === "js") {
    const languageDefaults = RecursiveCharacterTextSplitter.getSeparatorsForLanguage("js");
    return new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      separators: [...EXPORT_AWARE_JS_SEPARATORS, ...languageDefaults],
    });
  }

  return RecursiveCharacterTextSplitter.fromLanguage(language, {
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
}

export async function splitFileIntoChunks(file: ParsedFile): Promise<CodeChunk[]> {
  const splitter = buildSplitterFor(file.extension);
  const pieces = await splitter.splitText(file.content);

  return pieces.map((content) => ({
    filePath: file.relativePath,
    content,
    language: file.extension,
  }));
}

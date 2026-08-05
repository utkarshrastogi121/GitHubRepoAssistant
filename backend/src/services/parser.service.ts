import fs from "fs/promises";
import path from "path";
import { shouldIgnore, getExtension } from "../utils/file-helpers";

export interface ParsedFile {
  relativePath: string;
  absolutePath: string;
  extension: string;
  content: string;
}

const MAX_FILE_SIZE_BYTES = 300_000; // skip huge generated/binary files
const TEXT_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "json", "md", "py", "java", "go", "rb", "rs",
  "c", "cpp", "h", "hpp", "cs", "php", "html", "css", "scss", "yml", "yaml",
  "toml", "sh", "sql", "prisma", "env", "txt", "vue", "svelte",
]);

async function walk(dir: string, rootDir: string, files: ParsedFile[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;

    const absolutePath = path.join(dir, entry.name);
    const relativePath = path.relative(rootDir, absolutePath);

    if (entry.isDirectory()) {
      await walk(absolutePath, rootDir, files);
      continue;
    }

    const extension = getExtension(entry.name);
    if (!TEXT_EXTENSIONS.has(extension)) continue;

    const stat = await fs.stat(absolutePath);
    if (stat.size > MAX_FILE_SIZE_BYTES) continue;

    const content = await fs.readFile(absolutePath, "utf-8").catch(() => null);
    if (content === null) continue; // skip unreadable/binary files

    files.push({ relativePath, absolutePath, extension, content });
  }
}

export async function parseRepository(localPath: string): Promise<ParsedFile[]> {
  const files: ParsedFile[] = [];
  await walk(localPath, localPath, files);
  return files;
}

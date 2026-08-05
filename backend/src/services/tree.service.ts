import fs from "fs/promises";
import path from "path";
import { FileTreeNode } from "../types";
import { shouldIgnore } from "../utils/file-helpers";

async function buildNode(entryPath: string, rootDir: string): Promise<FileTreeNode | null> {
  const name = path.basename(entryPath);
  if (shouldIgnore(name)) return null;

  const stat = await fs.stat(entryPath);
  const relativePath = path.relative(rootDir, entryPath);

  if (stat.isDirectory()) {
    const entries = await fs.readdir(entryPath);
    const children: FileTreeNode[] = [];

    for (const entry of entries) {
      const childNode = await buildNode(path.join(entryPath, entry), rootDir);
      if (childNode) children.push(childNode);
    }

    // Directories first, then alphabetical - makes the tree readable in a UI
    children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { name, path: relativePath, type: "directory", children };
  }

  return { name, path: relativePath, type: "file" };
}

export async function buildFileTree(localPath: string): Promise<FileTreeNode[]> {
  const entries = await fs.readdir(localPath);
  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    const node = await buildNode(path.join(localPath, entry), localPath);
    if (node) nodes.push(node);
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

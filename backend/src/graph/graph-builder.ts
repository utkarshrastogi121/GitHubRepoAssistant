import path from "path";
import { ParsedFile } from "../services/parser.service";
import {
  CodeGraph,
  GraphEdge,
  GraphNode,
  fileNodeId,
  symbolNodeId,
} from "./types";

const CODE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "py", "java", "go",
]);

const CALL_KEYWORDS = new Set([
  "if", "for", "while", "switch", "catch", "return", "function",
  "class", "typeof", "instanceof", "new", "await", "yield",
]);

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

/** Top-level symbols defined in one file. Exported for chunking. */
export function extractSymbols(file: ParsedFile): GraphNode[] {
  const { content, relativePath, extension } = file;
  const found = new Map<string, GraphNode>();

  const add = (
    kind: GraphNode["kind"],
    name: string,
    index: number
  ) => {
    if (!found.has(name)) {
      found.set(name, {
        id: symbolNodeId(relativePath, name),
        kind,
        name,
        filePath: relativePath,
        symbol: name,
        line: lineOf(content, index),
      });
    }
  };

  if (extension === "py") {
    for (const m of content.matchAll(/^def\s+([A-Za-z_]\w*)/gm)) {
      if (m[1]) add("FUNCTION", m[1], m.index ?? 0);
    }
    for (const m of content.matchAll(/^class\s+([A-Za-z_]\w*)/gm)) {
      if (m[1]) add("CLASS", m[1], m.index ?? 0);
    }
    return [...found.values()];
  }

  // TS / JS / Java / Go share the same rough shapes.
  for (const m of content.matchAll(
    /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g
  )) {
    if (m[1]) add("FUNCTION", m[1], m.index ?? 0);
  }
  for (const m of content.matchAll(
    /(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g
  )) {
    if (m[1]) add("CLASS", m[1], m.index ?? 0);
  }
  for (const m of content.matchAll(
    /(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/g
  )) {
    if (m[1]) add("INTERFACE", m[1], m.index ?? 0);
  }
  for (const m of content.matchAll(
    /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g
  )) {
    if (m[1]) add("FUNCTION", m[1], m.index ?? 0);
  }
  for (const m of content.matchAll(
    /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[^\n=]*=>/g
  )) {
    if (m[1]) add("FUNCTION", m[1], m.index ?? 0);
  }
  return [...found.values()];
}

function extractImportSpecs(file: ParsedFile): { spec: string; line: number }[] {
  const { content, extension } = file;
  const specs: { spec: string; line: number }[] = [];

  if (extension === "py") {
    for (const m of content.matchAll(
      /^\s*from\s+(\.+[\w.]*)\s+import\s+/gm
    )) {
      if (m[1]) specs.push({ spec: m[1], line: lineOf(content, m.index ?? 0) });
    }
    return specs;
  }

  for (const m of content.matchAll(
    /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g
  )) {
    if (m[1]) specs.push({ spec: m[1], line: lineOf(content, m.index ?? 0) });
  }
  for (const m of content.matchAll(
    /require\(\s*['"]([^'"]+)['"]\s*\)/g
  )) {
    if (m[1]) specs.push({ spec: m[1], line: lineOf(content, m.index ?? 0) });
  }
  return specs;
}

/**
 * Resolve a relative import (`./x`, `../utils`) to a file in the repo.
 * Tries the spec as-is, then + .ts/.tsx/.js/.jsx/.py, then /index.*.
 * Returns null for package imports (`react`, `express`) and for
 * anything not present in the repo - those are not graph edges.
 */
export function resolveRelativeImport(
  fromFile: string,
  spec: string,
  fileSet: Set<string>
): string | null {
  if (!spec.startsWith(".")) return null;

  const base = path.posix.join(
    path.posix.dirname(fromFile),
    spec
  );
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.py`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
    `${base}/index.py`,
  ];
  for (const c of candidates) {
    const normalised = c.replace(/^\.\//, "");
    if (fileSet.has(normalised)) return normalised;
    if (fileSet.has(c)) return c;
  }
  return null;
}

export function buildCodeGraph(files: ParsedFile[]): CodeGraph {
  const codeFiles = files.filter((f) => CODE_EXTENSIONS.has(f.extension));
  const fileSet = new Set(codeFiles.map((f) => f.relativePath));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();
  const addEdge = (fromId: string, toId: string, type: GraphEdge["type"]) => {
    if (fromId === toId) return;
    const key = `${fromId}|${type}|${toId}`;
    if (seenEdges.has(key)) return;
    seenEdges.add(key);
    edges.push({ fromId, toId, type });
  };

  const symbolByName = new Map<string, GraphNode[]>();
  const symbolsByFile = new Map<string, GraphNode[]>();

  for (const file of codeFiles) {
    nodes.push({
      id: fileNodeId(file.relativePath),
      kind: "FILE",
      name: file.relativePath.split("/").pop() ?? file.relativePath,
      filePath: file.relativePath,
    });

    const symbols = extractSymbols(file);
    symbolsByFile.set(file.relativePath, symbols);
    for (const s of symbols) {
      nodes.push(s);
      addEdge(s.id, fileNodeId(file.relativePath), "DEFINED_IN");
      const list = symbolByName.get(s.name) ?? [];
      list.push(s);
      symbolByName.set(s.name, list);
    }
  }

  for (const file of codeFiles) {
    for (const { spec } of extractImportSpecs(file)) {
      const target = resolveRelativeImport(
        file.relativePath,
        spec,
        fileSet
      );
      if (target) {
        addEdge(fileNodeId(file.relativePath), fileNodeId(target), "IMPORTS");
      }
    }
  }

  for (const file of codeFiles) {
    const symbols = [...(symbolsByFile.get(file.relativePath) ?? [])].sort(
      (a, b) => (a.line ?? 0) - (b.line ?? 0)
    );
    for (const m of file.content.matchAll(
      /([A-Za-z_$][\w$]*)\s*\(/g
    )) {
      const name = m[1];
      if (!name || CALL_KEYWORDS.has(name)) continue;
      const before = file.content.slice(Math.max(0, (m.index ?? 0) - 20), m.index ?? 0);
      if (/\bfunction\s*$/.test(before)) continue;

      const callees = symbolByName.get(name);
      if (!callees || callees.length === 0) continue;
      const callee =
        callees.find((c) => c.filePath === file.relativePath) ?? callees[0];
      const callLine = lineOf(file.content, m.index ?? 0);
      let caller: GraphNode | undefined;
      for (const s of symbols) {
        if ((s.line ?? 0) <= callLine) caller = s;
        else break;
      }
      addEdge(
        caller ? caller.id : fileNodeId(file.relativePath),
        callee.id,
        "CALLS"
      );
    }
  }

  return { nodes, edges };
}

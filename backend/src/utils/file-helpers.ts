const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  ".venv",
  "__pycache__",
]);

const IGNORED_FILES = new Set([".DS_Store"]);

export function shouldIgnore(name: string): boolean {
  return IGNORED_DIRS.has(name) || IGNORED_FILES.has(name);
}

export function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

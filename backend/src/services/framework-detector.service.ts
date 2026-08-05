import fs from "fs/promises";
import path from "path";
import { ParsedFile } from "./parser.service";

interface DetectionResult {
  language: string | null;
  framework: string | null;
}

async function readPackageJson(localPath: string): Promise<any | null> {
  try {
    const raw = await fs.readFile(path.join(localPath, "package.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function detectFrameworkAndLanguage(
  localPath: string,
  files: ParsedFile[]
): Promise<DetectionResult> {
  const packageJson = await readPackageJson(localPath);

  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps["next"]) return { language: "TypeScript/JavaScript", framework: "Next.js" };
    if (deps["react"]) return { language: "TypeScript/JavaScript", framework: "React" };
    if (deps["vue"]) return { language: "TypeScript/JavaScript", framework: "Vue" };
    if (deps["express"]) return { language: "TypeScript/JavaScript", framework: "Express.js" };
    if (deps["@nestjs/core"]) return { language: "TypeScript/JavaScript", framework: "NestJS" };
    if (deps["fastify"]) return { language: "TypeScript/JavaScript", framework: "Fastify" };

    return { language: "TypeScript/JavaScript", framework: null };
  }

  const hasFile = (name: string) => files.some((f) => f.relativePath === name);

  if (hasFile("requirements.txt") || hasFile("pyproject.toml")) {
    const isDjango = files.some((f) => f.relativePath.endsWith("manage.py"));
    const isFlask = files.some((f) => f.content.includes("from flask import"));
    return {
      language: "Python",
      framework: isDjango ? "Django" : isFlask ? "Flask" : null,
    };
  }

  if (hasFile("go.mod")) return { language: "Go", framework: null };
  if (hasFile("pom.xml") || hasFile("build.gradle")) {
    const isSpring = files.some((f) => f.content.includes("org.springframework"));
    return { language: "Java", framework: isSpring ? "Spring" : null };
  }
  if (hasFile("Cargo.toml")) return { language: "Rust", framework: null };
  if (hasFile("Gemfile")) return { language: "Ruby", framework: "Rails" };

  // Fallback: guess by counting file extensions
  const counts: Record<string, number> = {};
  for (const file of files) {
    counts[file.extension] = (counts[file.extension] ?? 0) + 1;
  }
  const topExtension = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return { language: topExtension ? topExtension[0] : null, framework: null };
}

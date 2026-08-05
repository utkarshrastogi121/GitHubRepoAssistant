// Prompt template for generating a README.md for the analyzed repository.

import { FileTreeNode } from "../../types";

export function buildReadmePrompt(
  owner: string,
  name: string,
  language: string | null,
  framework: string | null,
  fileTree: FileTreeNode[]
): string {
  return `You are a technical writer generating a professional README.md for a GitHub repository.

Repository: ${owner}/${name}
Primary language: ${language ?? "unknown"}
Framework: ${framework ?? "none detected"}

File structure (JSON):
${JSON.stringify(fileTree, null, 2)}

Write a complete README.md in Markdown with sections: Title, Description, Features,
Tech Stack, Project Structure, Installation, Usage, and Contributing.
Infer the purpose of the project from the file/folder names. Be concise and professional.
Return ONLY the Markdown content, no extra commentary.`;
}

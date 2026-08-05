// Prompt templates for all "code review" style features: bugs, code smells,
// suggestions, API explanation, business logic explanation.
// Kept as small focused functions rather than one giant configurable prompt.
//
// IMPORTANT: each function builds ONE prompt covering MULTIPLE files, so the
// service only needs ONE generateContent call per feature request - not one
// call per file. This matters a lot on rate/quota-limited API keys (Gemini's
// free tier caps requests-per-day quite low), where looping per file could
// burn through a day's entire quota on a single API call.

interface ReviewFile {
  filePath: string;
  content: string;
}

function formatFiles(files: ReviewFile[]): string {
  return files
    .map((f) => `File: ${f.filePath}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n---\n\n");
}

export function buildBugDetectionPrompt(files: ReviewFile[]): string {
  return `You are a senior code reviewer. Analyze the following files for potential bugs
(logic errors, null/undefined issues, off-by-one errors, unhandled exceptions, race conditions).

${formatFiles(files)}

For each file, list any bugs found as bullet points with: line/area, description, and suggested fix.
Organize your answer under a heading per file (use the file path as the heading).
If a file has no bugs, say so explicitly under its heading. Return Markdown only.`;
}

export function buildCodeSmellPrompt(files: ReviewFile[]): string {
  return `You are a senior code reviewer. Identify code smells in the following files
(long functions, duplicated logic, poor naming, tight coupling, magic numbers, etc).

${formatFiles(files)}

Organize your answer under a heading per file (use the file path as the heading), with a bullet list
of code smells and brief explanations under each. Return Markdown only.`;
}

export function buildSuggestionsPrompt(files: ReviewFile[]): string {
  return `You are a senior engineer mentoring a junior developer. Suggest concrete
improvements to the following files (readability, performance, structure, best practices).

${formatFiles(files)}

Organize your answer under a heading per file (use the file path as the heading), with a bullet list
of specific, actionable suggestions under each. Return Markdown only.`;
}

export function buildApiExplanationPrompt(files: ReviewFile[]): string {
  return `You are documenting an API. Based on the following route/controller files,
list every API endpoint you can find with: HTTP method, path, purpose, and expected request/response shape.

${formatFiles(files)}

Return the result as a Markdown table.`;
}

export function buildLogicExplanationPrompt(files: ReviewFile[]): string {
  return `Explain the business logic implemented in each of the following files in plain English,
as if explaining it to a new engineer joining the team.

${formatFiles(files)}

Organize your answer under a heading per file (use the file path as the heading).
Return a clear, concise explanation in Markdown.`;
}

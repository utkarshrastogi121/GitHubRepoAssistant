// Re-exports the RAG prompt builder so all prompt templates are discoverable
// from the same llm/prompts/ folder, per the project's folder-structure rule.

export { buildRagPrompt } from "../../rag/prompt-builder";



import { EvaluationQuestion } from "./types";

export const SAMPLE_QUESTIONS: EvaluationQuestion[] = [
  {
    question: "Where is generateText defined and where is it used?",
    expectedFiles: [
      "backend/src/llm/gemini-client.ts",
      "backend/src/services/rag.service.ts",
      "backend/src/services/review.service.ts",
      "backend/src/services/readme.service.ts",
      "backend/src/services/diagram.service.ts",
    ],
  },
  {
    question: "How does a chat message get answered?",
    expectedFiles: [
      "backend/src/services/rag.service.ts",
      "backend/src/rag/retriever.ts",
      "backend/src/rag/prompt-builder.ts",
      "backend/src/services/vectorstore.service.ts",
    ],
  },
  {
    question: "How is a repository indexed for RAG?",
    expectedFiles: [
      "backend/src/services/rag.service.ts",
      "backend/src/services/chunking.service.ts",
      "backend/src/services/embedding.service.ts",
      "backend/src/services/vectorstore.service.ts",
      "backend/src/graph/graph-builder.ts",
    ],
  },
  {
    question: "Where is the code graph built and stored?",
    expectedFiles: [
      "backend/src/graph/graph-builder.ts",
      "backend/src/graph/graph-store.ts",
      "backend/src/graph/graph-expander.ts",
      "backend/prisma/schema.prisma",
    ],
  },
  {
    question: "What happens when I click Index Repository?",
    expectedFiles: [
      "frontend/src/pages/ChatPage.tsx",
      "frontend/src/api/chat.ts",
      "backend/src/controllers/chat.controller.ts",
      "backend/src/services/rag.service.ts",
    ],
  },
];

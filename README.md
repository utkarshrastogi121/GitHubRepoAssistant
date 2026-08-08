# AI GitHub Repository Assistant

An AI-powered full-stack application that analyzes public GitHub repositories. It can understand a repository's codebase, answer questions using RAG, generate documentation, visualize architecture, and perform AI-powered code reviews.

## Features

* Analyze any public GitHub repository
* Detect language and framework automatically
* Explore repository file structure
* Chat with the codebase using RAG
* Generate README and architecture diagrams
* Detect bugs and code smells
* Generate code improvement suggestions
* Explain APIs and business logic
* Store analysis and chat history

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express.js, TypeScript, PostgreSQL, Prisma
**AI / RAG:** Google Gemini, LangChain.js, ChromaDB
**Other:** GitHub REST API, simple-git, Zod, Swagger/OpenAPI

## Architecture

```text
React + TypeScript
        |
        v
Express + TypeScript
        |
   +----+----+
   |         |
   v         v
PostgreSQL  ChromaDB
  Prisma    Vector Store
              |
              v
         Gemini API
```

## RAG Pipeline

```text
GitHub Repository
       |
    Clone
       |
  Read Files
       |
 Text Splitting
       |
  Embeddings
       |
   ChromaDB
       |
Similarity Search
       |
Relevant Code
       |
  Gemini LLM
       |
   Response
```

## Getting Started

### Clone

```bash
git clone https://github.com/utkarshrastogi121/GitHubRepoAssistant.git
cd GitHubRepoAssistant
```

### Backend

```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

Backend: `http://localhost:4000`
Swagger: `http://localhost:4000/api-docs`

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

## Environment Variables

### Backend

```env
DATABASE_URL=
DIRECT_URL=
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_EMBEDDING_MODEL=
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
CLONE_TMP_DIR=
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:4000
```

## API Highlights

| Method | Endpoint                                 | Description                   |
| ------ | ---------------------------------------- | ------------------------------ |
| POST   | `/api/repos/analyze`                     | Analyze repository            |
| POST   | `/api/chat/:repoId/index`                | Index repository for RAG      |
| POST   | `/api/chat/:repoId/message`              | Chat with repository          |
| POST   | `/api/docs/:repoId/readme`               | Generate README               |
| POST   | `/api/docs/:repoId/architecture-diagram` | Generate architecture diagram |
| POST   | `/api/review/:repoId/bugs`               | Detect bugs                   |
| POST   | `/api/review/:repoId/code-smells`        | Detect code smells            |
| POST   | `/api/review/:repoId/suggestions`        | Generate suggestions          |

## Live Demo

**Frontend:** https://github-repo-assistant-taupe.vercel.app/

**Backend API:** https://githubrepoassistant.onrender.com/api

**Swagger Docs:** https://githubrepoassistant.onrender.com/api-docs

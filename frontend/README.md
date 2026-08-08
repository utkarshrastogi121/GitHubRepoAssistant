# AI GitHub Repository Assistant — Frontend

React + TypeScript + Vite frontend for the AI GitHub Repository Assistant.
Lets you analyze any public GitHub repository, chat with its code via RAG,
generate a README + architecture diagram, and run AI-powered code review -
all backed by the [backend API](../backend).

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- `react-markdown` (renders README/review output)
- `mermaid` (renders architecture diagrams)

## Getting Started

### 1. Prerequisites
- Node.js 18+
- The backend running (see `../backend/README.md`) - default expected at `http://localhost:4000`

### 2. Install
```bash
npm install
cp .env.example .env
```

By default `.env` points at `http://localhost:4000/api`. Change `VITE_API_BASE_URL` if your backend runs elsewhere.

### 3. Run in development
```bash
npm run dev
```
Opens at `http://localhost:5173`.

### 4. Build for production
```bash
npm run build
npm run preview
```

## App Flow

1. **Repositories page (`/`)** — paste a GitHub URL, hit Analyze. This calls `POST /repos/analyze` and takes you to the repo's detail page.
2. **Repository detail (`/repos/:id`)** — view the file tree, then jump to Chat / Docs / Review.
3. **Chat (`/chat`)** — index the repo once (`POST /chat/:repoId/index`), then ask questions (`POST /chat/:repoId/message`). The conversation persists via a `sessionId` returned on your first message.
4. **Docs (`/docs`)** — generate a README and/or a Mermaid architecture diagram.
5. **Review (`/review`)** — run bug detection, code smell detection, improvement suggestions, API explanation, or business logic explanation.

## Project Structure

```
src/
├── api/          # one file per backend feature area - all HTTP calls live here
├── components/   # organized by feature (repo, chat, docs, review) + shared "common" components
├── contexts/      # RepoContext - tracks the currently-selected repository across pages
├── pages/        # one component per route
├── types/        # shared TypeScript types mirroring backend API responses
└── utils/        # small helpers (e.g. date formatting)
```

## Notes
- There's no authentication (matching the backend, which only supports public repos).
- The currently-selected repository is kept in React Context (`RepoContext`), not the URL, except on the detail page - so navigating between Chat/Docs/Review keeps working with the same repo without re-fetching.

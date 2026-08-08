// Tracks the currently-selected repository across pages (Chat, Docs, Review
// pages all need to know "which repo am I working with"). A simple React
// Context is enough here - no need for a state management library for one
// piece of shared state.

import { createContext, useContext, useState, ReactNode } from "react";
import { Repository } from "@/types";

interface RepoContextValue {
  activeRepo: Repository | null;
  setActiveRepo: (repo: Repository | null) => void;
}

const RepoContext = createContext<RepoContextValue | undefined>(undefined);

export function RepoProvider({ children }: { children: ReactNode }) {
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);

  return (
    <RepoContext.Provider value={{ activeRepo, setActiveRepo }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo(): RepoContextValue {
  const context = useContext(RepoContext);
  if (!context) throw new Error("useRepo must be used within a RepoProvider");
  return context;
}

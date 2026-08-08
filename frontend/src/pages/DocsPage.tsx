// Docs generation page: README + Mermaid architecture diagram.
// Matches POST /docs/:repoId/readme and POST /docs/:repoId/architecture-diagram.

import { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { ReadmePreview } from "@/components/docs/ReadmePreview";
import { MermaidDiagram } from "@/components/docs/MermaidDiagram";
import { useRepo } from "@/contexts/RepoContext";
import { generateReadme, generateArchitectureDiagram } from "@/api/docs";

export default function DocsPage() {
  const { activeRepo } = useRepo();
  const [readme, setReadme] = useState<string | null>(null);
  const [diagram, setDiagram] = useState<string | null>(null);
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeRepo) {
    return (
      <PageContainer title="Docs">
        <ErrorBanner message="No repository selected. Analyze or select a repository first." />
        <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Go to Repositories
        </Link>
      </PageContainer>
    );
  }

  async function handleGenerateReadme() {
    setIsGeneratingReadme(true);
    setError(null);
    try {
      const result = await generateReadme(activeRepo!.id);
      setReadme(result.markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate README");
    } finally {
      setIsGeneratingReadme(false);
    }
  }

  async function handleGenerateDiagram() {
    setIsGeneratingDiagram(true);
    setError(null);
    try {
      const result = await generateArchitectureDiagram(activeRepo!.id);
      setDiagram(result.mermaid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate diagram");
    } finally {
      setIsGeneratingDiagram(false);
    }
  }

  return (
    <PageContainer
      title={`Docs for ${activeRepo.owner}/${activeRepo.name}`}
      description="Generate a README.md and an architecture diagram using AI."
    >
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mb-6 flex gap-3">
        <Button onClick={handleGenerateReadme} isLoading={isGeneratingReadme}>
          Generate README
        </Button>
        <Button variant="secondary" onClick={handleGenerateDiagram} isLoading={isGeneratingDiagram}>
          Generate Architecture Diagram
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {readme && <ReadmePreview markdown={readme} />}
        {diagram && <MermaidDiagram code={diagram} />}
      </div>
    </PageContainer>
  );
}

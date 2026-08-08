// Renders raw Mermaid diagram code (returned by the backend as a plain
// string) into an SVG using the mermaid library.

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Architecture Diagram</h3>
      {error ? (
        <div className="text-sm text-red-600">
          <p>Could not render diagram: {error}</p>
          <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-3 text-xs">{code}</pre>
        </div>
      ) : (
        <div ref={containerRef} className="overflow-x-auto" />
      )}
    </div>
  );
}

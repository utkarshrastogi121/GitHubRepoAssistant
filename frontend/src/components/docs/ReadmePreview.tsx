import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface ReadmePreviewProps {
  markdown: string;
}

export function ReadmePreview({ markdown }: ReadmePreviewProps) {
  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Generated README.md</h3>
        <button
          onClick={handleDownload}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Download
        </button>
      </div>
      <MarkdownRenderer content={markdown} />
    </div>
  );
}

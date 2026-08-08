// Shared react-markdown wrapper with consistent Tailwind typography styling.
// Used to render README output, review reports, and API explanations -
// anywhere the backend returns a { markdown: string } response.

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-brand-600 prose-pre:bg-gray-900 prose-pre:text-gray-100">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

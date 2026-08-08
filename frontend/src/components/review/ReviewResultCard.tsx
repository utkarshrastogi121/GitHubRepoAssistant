import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface ReviewResultCardProps {
  title: string;
  markdown: string;
}

export function ReviewResultCard({ title, markdown }: ReviewResultCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <MarkdownRenderer content={markdown} />
    </div>
  );
}

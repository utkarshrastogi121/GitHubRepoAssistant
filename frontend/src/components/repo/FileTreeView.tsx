// Recursively renders the repository's fileTree JSON (returned by the
// backend's tree.service.ts) as a collapsible tree.

import { useState } from "react";
import { FileTreeNode } from "@/types";

function TreeNode({ node, depth }: { node: FileTreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isDirectory = node.type === "directory";

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-sm ${
          isDirectory ? "cursor-pointer hover:bg-gray-100" : "text-gray-600"
        }`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => isDirectory && setExpanded((prev) => !prev)}
      >
        <span className="w-4 text-gray-400">{isDirectory ? (expanded ? "▾" : "▸") : ""}</span>
        <span>{isDirectory ? "📁" : "📄"}</span>
        <span className={isDirectory ? "font-medium text-gray-800" : ""}>{node.name}</span>
      </div>

      {isDirectory && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileTreeViewProps {
  tree: FileTreeNode[];
}

export function FileTreeView({ tree }: FileTreeViewProps) {
  if (tree.length === 0) {
    return <p className="text-sm text-gray-500">No files found.</p>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      {tree.map((node) => (
        <TreeNode key={node.path} node={node} depth={0} />
      ))}
    </div>
  );
}

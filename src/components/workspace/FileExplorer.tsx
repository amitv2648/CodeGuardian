"use client";

import { ChevronRight, File, Folder } from "lucide-react";
import { useState } from "react";
import { FileNode } from "@/lib/mockData";
import { useWorkspace } from "./WorkspaceContext";

function FileTreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const { activeFile, openFile } = useWorkspace();
  const isFolder = node.type === "folder";
  const isActive = activeFile === node.path;

  if (isFolder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 w-full text-left py-0.5 px-2 text-xs border-none cursor-pointer"
          style={{
            paddingLeft: `${depth * 12 + 8}px`,
            background: "transparent",
            color: "var(--cg-text)",
          }}
        >
          <ChevronRight
            className="w-3 h-3 shrink-0 transition-transform"
            style={{
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              color: "var(--cg-text-muted)",
            }}
          />
          <Folder className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--cg-accent)" }} />
          <span>{node.name}</span>
        </button>
        {expanded &&
          node.children?.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openFile(node.path)}
      className="flex items-center gap-1.5 w-full text-left py-0.5 px-2 text-xs border-none cursor-pointer"
      style={{
        paddingLeft: `${depth * 12 + 24}px`,
        background: isActive ? "var(--cg-bg-hover)" : "transparent",
        color: isActive ? "var(--cg-accent)" : "var(--cg-text-muted)",
      }}
    >
      <File className="w-3.5 h-3.5 shrink-0" />
      <span>{node.name}</span>
    </button>
  );
}

export function FileExplorer() {
  const { fileTree } = useWorkspace();

  if (fileTree.length === 0) {
    return (
      <div className="p-3 text-xs" style={{ color: "var(--cg-text-muted)" }}>
        Empty IDE. Load a demo repo or clone a GitHub repo to begin debugging.
      </div>
    );
  }

  return (
    <div className="cg-scrollbar overflow-y-auto h-full py-1">
      {fileTree.map((node) => (
        <FileTreeItem key={node.path} node={node} />
      ))}
    </div>
  );
}

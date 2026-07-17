"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useWorkspace } from "./WorkspaceContext";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center h-full text-sm"
      style={{ color: "var(--cg-text-muted)" }}
    >
      Loading editor…
    </div>
  ),
});

function getLanguage(path: string): string {
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".css")) return "css";
  return "plaintext";
}

export function EditorArea() {
  const {
    openTabs,
    activeFile,
    setActiveFile,
    closeTab,
    fileContents,
    updateFileContent,
  } = useWorkspace();
  const { theme } = useTheme();
  const content = activeFile ? fileContents[activeFile] ?? "// File not found" : "";

  return (
    <div className="flex flex-col h-full min-w-0">
      <div
        className="flex items-center overflow-x-auto shrink-0 border-b cg-scrollbar"
        style={{
          background: "var(--cg-bg-tertiary)",
          borderColor: "var(--cg-border)",
        }}
      >
        {openTabs.map((tab) => {
          const isActive = tab === activeFile;
          const fileName = tab.split("/").pop();
          return (
            <div
              key={tab}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-r cursor-pointer shrink-0"
              style={{
                background: isActive ? "var(--cg-bg)" : "transparent",
                borderColor: "var(--cg-border)",
                color: isActive ? "var(--cg-text)" : "var(--cg-text-muted)",
                borderTop: isActive ? "2px solid var(--cg-accent)" : "2px solid transparent",
              }}
              onClick={() => setActiveFile(tab)}
            >
              <span>{fileName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab);
                }}
                className="p-0 border-none bg-transparent cursor-pointer flex items-center"
                style={{ color: "var(--cg-text-muted)" }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex-1 min-h-0">
        {!activeFile ? (
          <div
            className="h-full flex items-center justify-center text-sm"
            style={{ color: "var(--cg-text-muted)" }}
          >
            No file open. Select a file from Explorer.
          </div>
        ) : (
        <MonacoEditor
          key={`${activeFile}-${theme.id}`}
          language={getLanguage(activeFile)}
          value={content}
          onChange={(next) => updateFileContent(activeFile, next)}
          theme={theme.monacoTheme}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "off",
            padding: { top: 8 },
            renderLineHighlight: "line",
            automaticLayout: true,
          }}
        />
        )}
      </div>
    </div>
  );
}

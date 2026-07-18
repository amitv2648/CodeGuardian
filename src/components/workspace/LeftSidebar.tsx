"use client";

import { GitCommitHorizontal } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import { FileExplorer } from "./FileExplorer";

export function LeftSidebar() {
  const {
    activityView,
    issues,
    fixedIssueIds,
    repoName,
    repoSource,
    setShowRepairReport,
    setShowCommitModal,
    commitHistory,
  } = useWorkspace();

  const titles: Record<string, string> = {
    explorer: "Explorer",
    diagnostics: "Diagnostics",
    repairs: "Repairs",
    reports: "Reports",
    settings: "Settings",
  };

  return (
    <aside
      className="flex flex-col w-56 shrink-0 border-r"
      style={{
        background: "var(--cg-bg-secondary)",
        borderColor: "var(--cg-border)",
      }}
    >
      <div
        className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider border-b shrink-0"
        style={{ borderColor: "var(--cg-border)", color: "var(--cg-text-muted)" }}
      >
        {titles[activityView]}
      </div>

      <div className="flex-1 overflow-hidden">
        {activityView === "explorer" && <FileExplorer />}

        {activityView === "diagnostics" && (
          <div className="p-3 text-xs space-y-2 cg-scrollbar overflow-y-auto h-full">
            {issues.length === 0 ? (
              <p style={{ color: "var(--cg-text-muted)" }}>
                {repoName
                  ? "No diagnostics yet. Click Diagnose in the top bar."
                  : "No repository loaded. Load a repo before running diagnostics."}
              </p>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-2 rounded border"
                  style={{ borderColor: "var(--cg-border)" }}
                >
                  <div className="font-medium mb-1">{issue.title}</div>
                  <div style={{ color: "var(--cg-text-muted)" }}>{issue.rootCause}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activityView === "repairs" && (
          <div className="p-3 text-xs cg-scrollbar overflow-y-auto h-full">
            {fixedIssueIds.length === 0 ? (
              <p style={{ color: "var(--cg-text-muted)" }}>
                No verified repairs yet. Select an issue and apply a minimal patch.
              </p>
            ) : (
              <ul className="m-0 pl-4 space-y-1">
                {issues
                  .filter((i) => fixedIssueIds.includes(i.id))
                  .map((i) => (
                    <li key={i.id}>
                      <span style={{ color: "var(--cg-success)" }}>✓</span> {i.title}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {activityView === "reports" && (
          <div className="p-3 text-xs">
            <p className="mb-3" style={{ color: "var(--cg-text-muted)" }}>
              View the full repair audit report with verification results.
            </p>
            <button
              type="button"
              onClick={() => setShowRepairReport(true)}
              className="cg-btn-primary text-xs w-full"
            >
              Open Repair Report
            </button>
          </div>
        )}

        {activityView === "settings" && (
          <div className="p-3 text-xs space-y-3">
            <div>
              <div className="font-semibold mb-1">Mode</div>
              <p style={{ color: "var(--cg-text-muted)" }}>Debugger Mode — repairs only, no feature building.</p>
            </div>
            <div>
              <div className="font-semibold mb-1">Repository</div>
              <p className="font-mono" style={{ color: "var(--cg-text-muted)" }}>
                {repoName ?? "None"}
              </p>
              <p style={{ color: "var(--cg-text-muted)" }}>
                Source: {repoSource === "none" ? "empty workspace" : repoSource}
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">Theme</div>
              <p style={{ color: "var(--cg-text-muted)" }}>
                Use the theme selector in the top bar.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-t p-2 space-y-1.5"
        style={{ borderColor: "var(--cg-border)", background: "var(--cg-bg-tertiary)" }}
      >
        <button
          type="button"
          onClick={() => setShowCommitModal(true)}
          disabled={!repoName || fixedIssueIds.length === 0}
          className="cg-btn-primary w-full text-xs flex items-center justify-center gap-1.5"
        >
          <GitCommitHorizontal className="w-3 h-3" />
          Commit Changes
        </button>
        <p className="text-[10px] m-0 px-1" style={{ color: "var(--cg-text-muted)" }}>
          Stage specific fixed issues and choose your commit message.
        </p>
        {commitHistory[0] && (
          <p className="text-[10px] m-0 px-1 truncate" style={{ color: "var(--cg-text-muted)" }}>
            Last commit: {commitHistory[0].message}
          </p>
        )}
      </div>
    </aside>
  );
}

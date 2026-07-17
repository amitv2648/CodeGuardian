"use client";

import { Terminal, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { BottomTab, useWorkspace } from "./WorkspaceContext";

const tabs: { id: BottomTab; label: string; icon: typeof Terminal }[] = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "diagnostics", label: "Diagnostics", icon: AlertTriangle },
  { id: "verification", label: "Verification", icon: CheckCircle },
];

export function BottomPanel() {
  const {
    bottomTab,
    setBottomTab,
    terminalOutput,
    issues,
    repairPhase,
    verificationStatus,
  } = useWorkspace();

  return (
    <div
      className="flex flex-col shrink-0 border-t"
      style={{
        height: "200px",
        background: "var(--cg-bg-secondary)",
        borderColor: "var(--cg-border)",
      }}
    >
      <div
        className="flex items-center border-b shrink-0"
        style={{ borderColor: "var(--cg-border)" }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setBottomTab(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-none cursor-pointer"
            style={{
              background: bottomTab === id ? "var(--cg-bg)" : "transparent",
              color: bottomTab === id ? "var(--cg-text)" : "var(--cg-text-muted)",
              borderBottom: bottomTab === id ? "2px solid var(--cg-accent)" : "2px solid transparent",
            }}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto cg-scrollbar p-3 font-mono text-xs leading-relaxed">
        {bottomTab === "terminal" && (
          <pre className="m-0 whitespace-pre-wrap" style={{ color: "var(--cg-text-muted)" }}>
            {terminalOutput}
          </pre>
        )}

        {bottomTab === "diagnostics" && (
          <div className="space-y-2">
            {repairPhase === "diagnosing" && (
              <div className="flex items-center gap-2" style={{ color: "var(--cg-accent)" }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Running npm run typecheck, npm test, npm run build…
              </div>
            )}
            {issues.length === 0 && repairPhase !== "diagnosing" && (
              <p style={{ color: "var(--cg-text-muted)" }}>
                Click Diagnose to run diagnostic commands and detect reproducible failures.
              </p>
            )}
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-start gap-2 p-2 rounded border"
                style={{ borderColor: "var(--cg-border)" }}
              >
                <span className={`cg-badge cg-badge-${issue.severity}`}>{issue.severity}</span>
                <div>
                  <div className="font-medium">{issue.title}</div>
                  <div style={{ color: "var(--cg-text-muted)" }}>
                    {issue.command} · {issue.file}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {bottomTab === "verification" && (
          <div>
            {repairPhase === "verifying" && verificationStatus === "pending" && (
              <div className="flex items-center gap-2 mb-3" style={{ color: "var(--cg-warning)" }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Running verification commands…
              </div>
            )}
            {verificationStatus === "passed" && (
              <div
                className="flex items-center gap-2 mb-3 p-2 rounded"
                style={{
                  background: "color-mix(in srgb, var(--cg-success) 15%, transparent)",
                  color: "var(--cg-success)",
                }}
              >
                <CheckCircle className="w-4 h-4" />
                Verification Passed — all diagnostic commands succeeded
              </div>
            )}
            {verificationStatus === "pending" && repairPhase !== "verifying" && (
              <p style={{ color: "var(--cg-text-muted)" }}>
                Verification results will appear here after applying a patch.
              </p>
            )}
            {verificationStatus === "passed" && (
              <pre className="m-0 whitespace-pre-wrap" style={{ color: "var(--cg-text-muted)" }}>
                {terminalOutput.split("$ npm run build")[1]
                  ? "$ npm run build" + terminalOutput.split("$ npm run build").slice(1).join("$ npm run build")
                  : terminalOutput}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

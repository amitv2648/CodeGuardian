"use client";

import { useTheme } from "@/hooks/useTheme";
import { useWorkspace } from "./WorkspaceContext";

export function StatusBar() {
  const { repairPhase, verificationStatus, issues, fixedIssueIds, repoName } = useWorkspace();
  const { theme } = useTheme();

  const items = [
    { label: "Authenticated", ok: true },
    { label: repoName ? "Repository loaded" : "Empty IDE", ok: Boolean(repoName) },
    {
      label: issues.length > 0 ? "Diagnostics ready" : "Awaiting diagnose",
      ok: issues.length > 0,
    },
    { label: "Debugger mode", ok: true },
    {
      label:
        verificationStatus === "passed"
          ? "Verification passed"
          : repairPhase === "verifying"
            ? "Verifying…"
            : "Verification pending",
      ok: verificationStatus === "passed",
    },
    { label: theme.name, ok: true },
  ];

  if (fixedIssueIds.length > 0) {
    items.splice(4, 0, {
      label: `${fixedIssueIds.length} verified repair${fixedIssueIds.length > 1 ? "s" : ""}`,
      ok: true,
    });
  }

  return (
    <footer
      className="flex items-center justify-between h-6 px-3 text-[10px] shrink-0 border-t"
      style={{
        background: "var(--cg-status-bar)",
        borderColor: "var(--cg-border)",
        color: "var(--cg-text-muted)",
      }}
    >
      <div className="flex items-center gap-3">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: item.ok ? "var(--cg-success)" : "var(--cg-text-muted)" }}
            />
            {item.label}
          </span>
        ))}
      </div>
      <span>{repoName ?? "No repository"}</span>
    </footer>
  );
}

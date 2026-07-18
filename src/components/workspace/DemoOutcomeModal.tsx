"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

export function DemoOutcomeModal() {
  const { demoMode, showDemoOutcome, setShowDemoOutcome, repoName, setShowRepairReport } =
    useWorkspace();

  if (!demoMode || !showDemoOutcome) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="w-full max-w-xl rounded-lg border shadow-2xl overflow-hidden"
        style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <h2 className="text-sm font-semibold m-0">Demo Output: Project Restored</h2>
          <button
            type="button"
            onClick={() => setShowDemoOutcome(false)}
            className="p-1 border-none bg-transparent cursor-pointer"
            style={{ color: "var(--cg-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-sm">
          <p className="m-0">
            Repository: <span className="font-mono">{repoName ?? "demo repo"}</span>
          </p>
          <div
            className="rounded-md border p-3"
            style={{ borderColor: "var(--cg-border)", background: "var(--cg-bg-tertiary)" }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: "var(--cg-error)" }}>
              <XCircle className="w-4 h-4" />
              <strong>Before CodeGuardian commit</strong>
            </div>
            <p className="m-0 text-xs" style={{ color: "var(--cg-text-muted)" }}>
              Typecheck, test, and build failed. The project could not run successfully.
            </p>
          </div>
          <div
            className="rounded-md border p-3"
            style={{ borderColor: "var(--cg-border)", background: "var(--cg-bg-tertiary)" }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: "var(--cg-success)" }}>
              <CheckCircle2 className="w-4 h-4" />
              <strong>After CodeGuardian commit</strong>
            </div>
            <p className="m-0 text-xs" style={{ color: "var(--cg-text-muted)" }}>
              Verified repairs were committed and the project now passes diagnostics.
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <button
            type="button"
            className="cg-btn-secondary text-xs"
            onClick={() => setShowDemoOutcome(false)}
          >
            Close
          </button>
          <button
            type="button"
            className="cg-btn-primary text-xs"
            onClick={() => {
              setShowDemoOutcome(false);
              setShowRepairReport(true);
            }}
          >
            View Repair Report
          </button>
        </div>
      </div>
    </div>
  );
}

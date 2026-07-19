"use client";

import { FileText, Loader2, Shield, Wrench } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import { DetectedIssue } from "@/lib/mockData";

function SeverityBadge({ severity }: { severity: DetectedIssue["severity"] }) {
  return <span className={`cg-badge cg-badge-${severity}`}>{severity}</span>;
}

export function IssuesPanel() {
  const {
    issues,
    selectedIssueId,
    setSelectedIssueId,
    repairPhase,
    fixSelectedIssue,
    fixAllIssues,
    setShowRepairReport,
    fixedIssueIds,
    setShowCommitModal,
    openFile,
  } = useWorkspace();
  const selectedIssue = issues.find((i) => i.id === selectedIssueId);
  const isRepairing = repairPhase === "planning" || repairPhase === "applying" || repairPhase === "verifying";

  return (
    <aside
      className="flex flex-col w-80 shrink-0 border-l"
      style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--cg-border)" }}>
        <Shield className="w-4 h-4" style={{ color: "var(--cg-accent)" }} />
        <span className="font-semibold text-xs">Detected Issues</span>
      </div>

      <div className="flex-1 overflow-y-auto cg-scrollbar">
        {issues.length === 0 ? (
          <p className="px-3 py-3 text-xs" style={{ color: "var(--cg-text-muted)" }}>
            Click Diagnose to detect reproducible failures.
          </p>
        ) : (
          issues.map((issue) => (
            <button
              key={issue.id}
              type="button"
              onClick={() => {
                setSelectedIssueId(issue.id);
                openFile(issue.file);
              }}
              className="w-full text-left px-3 py-2 border-none cursor-pointer border-b"
              style={{
                background: selectedIssueId === issue.id ? "var(--cg-bg-hover)" : "transparent",
                borderColor: "var(--cg-border)",
                color: "var(--cg-text)",
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <SeverityBadge severity={issue.severity} />
                {issue.status === "verified" && (
                  <span className="cg-badge cg-badge-success text-[9px]">verified</span>
                )}
              </div>
              <div className="text-xs font-medium">{issue.title}</div>
              <div className="text-[10px] font-mono" style={{ color: "var(--cg-text-muted)" }}>
                {issue.file}
              </div>
            </button>
          ))
        )}
      </div>

      {selectedIssue && (
        <div className="px-3 py-2 border-t text-xs space-y-1" style={{ borderColor: "var(--cg-border)" }}>
          <div><strong>Root cause:</strong> {selectedIssue.rootCause}</div>
          <div><strong>Repair boundary:</strong> {selectedIssue.repairBoundary}</div>
        </div>
      )}

      <div className="px-3 py-2 border-t space-y-1.5" style={{ borderColor: "var(--cg-border)" }}>
        <button
          type="button"
          onClick={fixSelectedIssue}
          disabled={!selectedIssueId || isRepairing || selectedIssue?.status === "verified"}
          className="cg-btn-primary w-full text-xs flex items-center justify-center gap-1.5"
        >
          {isRepairing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
          Resolve Selected Issue
        </button>
        <button
          type="button"
          onClick={fixAllIssues}
          disabled={issues.length === 0 || isRepairing}
          className="cg-btn-secondary w-full text-xs"
        >
          Resolve All Issues
        </button>
        <button
          type="button"
          onClick={() => setShowRepairReport(true)}
          className="cg-btn-secondary w-full text-xs flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3 h-3" />
          View Repair Report
        </button>
        <button
          type="button"
          onClick={() => setShowCommitModal(true)}
          disabled={fixedIssueIds.length === 0}
          className="cg-btn-secondary w-full text-xs"
        >
          Commit Changes
        </button>
      </div>
    </aside>
  );
}

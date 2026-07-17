"use client";

import { X, Copy, Download, CheckCircle } from "lucide-react";
import {
  DEMO_REPO_NAME,
  diagnosticCommands,
  mockIssues,
} from "@/lib/mockData";
import { useWorkspace } from "./WorkspaceContext";

export function RepairReportModal() {
  const { showRepairReport, setShowRepairReport, fixedIssueIds, issues } = useWorkspace();

  if (!showRepairReport) return null;

  const fixedIssues = issues.filter((i) => fixedIssueIds.includes(i.id));
  const filesChanged = [...new Set(fixedIssues.flatMap((i) => [i.file]))];

  const reportText = `# CodeGuardian Repair Report

## Repository
${DEMO_REPO_NAME}

## Diagnostic Commands Run
${diagnosticCommands.map((c) => `- ${c}`).join("\n")}

## Issues Found
${mockIssues.length}

## Issues Fixed
${fixedIssueIds.length}

## Files Changed
${filesChanged.map((f) => `- ${f}`).join("\n")}

## Verification Results
All verification commands passed after repair.

## Summary
CodeGuardian applied minimal patches within defined repair boundaries and verified each fix.`;

  function copyReport() {
    navigator.clipboard.writeText(reportText);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="w-full max-w-2xl rounded-lg border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <div>
            <h2 className="font-semibold text-sm m-0">Repair Report</h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: "var(--cg-text-muted)" }}>
              Verified Repair · {DEMO_REPO_NAME}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRepairReport(false)}
            className="p-1 border-none bg-transparent cursor-pointer"
            style={{ color: "var(--cg-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto cg-scrollbar space-y-4 text-sm flex-1">
          <ReportSection title="What was broken?">
            <ul className="m-0 pl-4 space-y-1">
              {mockIssues.map((i) => (
                <li key={i.id}>{i.title} — {i.file}</li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Why was it broken?">
            <ul className="m-0 pl-4 space-y-1">
              {mockIssues.map((i) => (
                <li key={i.id}>{i.rootCause}</li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="What did CodeGuardian change?">
            {fixedIssueIds.length === 0 ? (
              <p className="m-0" style={{ color: "var(--cg-text-muted)" }}>
                No repairs applied yet. Fix issues to populate this section.
              </p>
            ) : (
              <ul className="m-0 pl-4 space-y-1">
                {fixedIssues.map((i) => (
                  <li key={i.id}>
                    {i.title}: minimal patch applied to {i.file}
                  </li>
                ))}
              </ul>
            )}
          </ReportSection>

          <ReportSection title="How was the fix verified?">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" style={{ color: "var(--cg-success)" }} />
              <span style={{ color: "var(--cg-success)" }}>Verification Passed</span>
            </div>
            <ul className="m-0 pl-4">
              {diagnosticCommands.map((c) => (
                <li key={c}>{c} — passed</li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Impact">
            <p className="m-0">
              {fixedIssueIds.length > 0
                ? `${fixedIssueIds.length} reproducible failure(s) resolved with minimal patches. Build, typecheck, and tests pass.`
                : "Run Diagnose and apply repairs to generate impact summary."}
            </p>
          </ReportSection>

          <ReportSection title="Risk notes">
            <p className="m-0" style={{ color: "var(--cg-text-muted)" }}>
              All repairs were low-risk, scoped to defined repair boundaries. No architectural changes or feature additions were made.
            </p>
          </ReportSection>

          <ReportSection title="Diagnostic commands run">
            <code className="text-xs font-mono block">
              {diagnosticCommands.join(" · ")}
            </code>
          </ReportSection>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t shrink-0"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <button
            type="button"
            onClick={() => alert("Markdown export coming soon")}
            className="cg-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3 h-3" />
            Export Markdown
          </button>
          <button
            type="button"
            onClick={copyReport}
            className="cg-btn-primary text-xs flex items-center gap-1.5"
          >
            <Copy className="w-3 h-3" />
            Copy Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--cg-accent)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

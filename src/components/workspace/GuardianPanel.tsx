"use client";

import { useState, FormEvent } from "react";
import { Shield, Send, Wrench, FileText, Loader2 } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import { DetectedIssue } from "@/lib/mockData";

const quickActions = [
  "Explain root cause",
  "Propose minimal fix",
  "Show affected files",
  "Verify fix",
];

function SeverityBadge({ severity }: { severity: DetectedIssue["severity"] }) {
  return <span className={`cg-badge cg-badge-${severity}`}>{severity}</span>;
}

export function GuardianPanel() {
  const {
    issues,
    selectedIssueId,
    setSelectedIssueId,
    repairPhase,
    fixSelectedIssue,
    fixAllIssues,
    setShowRepairReport,
    chatMessages,
    sendChatMessage,
    handleQuickAction,
    openFile,
  } = useWorkspace();

  const [chatInput, setChatInput] = useState("");
  const selectedIssue = issues.find((i) => i.id === selectedIssueId);
  const isRepairing = repairPhase === "planning" || repairPhase === "applying" || repairPhase === "verifying";

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput("");
  }

  return (
    <aside
      className="flex flex-col w-80 shrink-0 border-l"
      style={{
        background: "var(--cg-bg-secondary)",
        borderColor: "var(--cg-border)",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
        style={{ borderColor: "var(--cg-border)" }}
      >
        <Shield className="w-4 h-4" style={{ color: "var(--cg-accent)" }} />
        <span className="font-semibold text-xs">Guardian Panel</span>
      </div>

      {/* Detected Issues */}
      <div className="shrink-0 border-b" style={{ borderColor: "var(--cg-border)" }}>
        <div
          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--cg-text-muted)" }}
        >
          Detected Issues ({issues.length})
        </div>
        <div className="max-h-40 overflow-y-auto cg-scrollbar">
          {issues.length === 0 ? (
            <p className="px-3 pb-3 text-xs m-0" style={{ color: "var(--cg-text-muted)" }}>
              Run Diagnose to detect reproducible failures.
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
                  background:
                    selectedIssueId === issue.id
                      ? "var(--cg-bg-hover)"
                      : "transparent",
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
      </div>

      {/* Selected Issue Details */}
      {selectedIssue && (
        <div
          className="shrink-0 px-3 py-2 border-b text-xs space-y-1.5"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <div className="font-semibold text-[10px] uppercase" style={{ color: "var(--cg-text-muted)" }}>
            Issue Details
          </div>
          <DetailRow label="Root cause" value={selectedIssue.rootCause} />
          <DetailRow label="Repair boundary" value={selectedIssue.repairBoundary} />
          <DetailRow label="Verification" value={selectedIssue.verificationCommand} />
          <DetailRow label="Command" value={selectedIssue.command} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="shrink-0 px-3 py-2 space-y-1.5 border-b" style={{ borderColor: "var(--cg-border)" }}>
        <button
          type="button"
          onClick={fixSelectedIssue}
          disabled={!selectedIssueId || isRepairing || selectedIssue?.status === "verified"}
          className="cg-btn-primary w-full text-xs flex items-center justify-center gap-1.5"
        >
          {isRepairing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
          Fix Selected Issue
        </button>
        <button
          type="button"
          onClick={fixAllIssues}
          disabled={issues.length === 0 || isRepairing}
          className="cg-btn-secondary w-full text-xs"
        >
          Fix All Detected Issues
        </button>
        <button
          type="button"
          onClick={() => setShowRepairReport(true)}
          className="cg-btn-secondary w-full text-xs flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3 h-3" />
          View Repair Report
        </button>
      </div>

      {/* Guardian Chat */}
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider shrink-0"
          style={{ color: "var(--cg-text-muted)" }}
        >
          Guardian Chat
        </div>
        <div className="flex-1 overflow-y-auto cg-scrollbar px-3 space-y-2">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-md p-2 text-xs"
              style={{
                background:
                  msg.role === "guardian"
                    ? "var(--cg-bg-tertiary)"
                    : "color-mix(in srgb, var(--cg-accent) 10%, transparent)",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                className="text-[10px] font-semibold mb-0.5"
                style={{ color: msg.role === "guardian" ? "var(--cg-accent)" : "var(--cg-text-muted)" }}
              >
                {msg.role === "guardian" ? "Guardian" : "You"}
              </div>
              <p className="m-0 leading-relaxed">{msg.content}</p>
            </div>
          ))}
        </div>

        <div className="shrink-0 px-3 py-1 flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="text-[10px] px-2 py-0.5 rounded border cursor-pointer"
              style={{
                background: "var(--cg-bg-tertiary)",
                borderColor: "var(--cg-border)",
                color: "var(--cg-text-muted)",
              }}
            >
              {action}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="shrink-0 px-3 py-2 flex gap-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about a failure…"
            className="cg-input text-xs py-1.5 flex-1"
          />
          <button type="submit" className="cg-btn-primary px-2 py-1.5">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "var(--cg-text-muted)" }}>{label}: </span>
      <span>{value}</span>
    </div>
  );
}

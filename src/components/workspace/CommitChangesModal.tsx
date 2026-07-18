"use client";

import { useEffect, useState } from "react";
import { X, GitCommitHorizontal } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

export function CommitChangesModal() {
  const {
    showCommitModal,
    setShowCommitModal,
    issues,
    fixedIssueIds,
    commitChanges,
  } = useWorkspace();
  const committableIssues = issues.filter((issue) => fixedIssueIds.includes(issue.id));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("fix: verified repairs for selected issues");
  const [error, setError] = useState("");

  useEffect(() => {
    if (showCommitModal) {
      setSelectedIds(committableIssues.map((issue) => issue.id));
      setMessage("fix: verified repairs for selected issues");
      setError("");
    }
  }, [showCommitModal, committableIssues]);

  if (!showCommitModal) return null;

  function toggleIssue(issueId: string) {
    setSelectedIds((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
  }

  function handleCommit() {
    const ok = commitChanges(selectedIds, message);
    if (!ok) {
      setError("Select at least one verified issue and enter a commit message.");
    }
  }

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
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="w-4 h-4" style={{ color: "var(--cg-accent)" }} />
            <span className="font-semibold text-sm">Commit Changes</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCommitModal(false)}
            className="p-1 border-none bg-transparent cursor-pointer"
            style={{ color: "var(--cg-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--cg-text-muted)" }}>
              Stage verified issue repairs
            </div>
            {committableIssues.length === 0 ? (
              <p style={{ color: "var(--cg-text-muted)" }}>
                No verified issue repairs are available to commit yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto cg-scrollbar pr-1">
                {committableIssues.map((issue) => (
                  <label
                    key={issue.id}
                    className="flex items-start gap-2 p-2 rounded border cursor-pointer"
                    style={{ borderColor: "var(--cg-border)" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(issue.id)}
                      onChange={() => toggleIssue(issue.id)}
                    />
                    <div>
                      <div className="font-medium text-xs">{issue.title}</div>
                      <div className="text-[11px] font-mono" style={{ color: "var(--cg-text-muted)" }}>
                        {issue.file}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--cg-text-muted)" }}>
              Commit message
            </label>
            <input
              type="text"
              className="cg-input text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter commit message"
            />
          </div>

          {error && (
            <div
              className="text-xs px-2 py-1.5 rounded"
              style={{
                color: "var(--cg-error)",
                background: "color-mix(in srgb, var(--cg-error) 15%, transparent)",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <button type="button" onClick={() => setShowCommitModal(false)} className="cg-btn-secondary text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            className="cg-btn-primary text-xs flex items-center gap-1.5"
          >
            <GitCommitHorizontal className="w-3 h-3" />
            Commit Selected Changes
          </button>
        </div>
      </div>
    </div>
  );
}

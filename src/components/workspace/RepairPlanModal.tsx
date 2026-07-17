"use client";

import { X, Shield } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import { DiffPreview } from "./DiffPreview";

export function RepairPlanModal() {
  const {
    repairPhase,
    currentRepairPlan,
    currentDiff,
    applyPatch,
    cancelRepair,
  } = useWorkspace();

  if (repairPhase !== "preview" || !currentRepairPlan) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="w-full max-w-lg rounded-lg border shadow-2xl overflow-hidden"
        style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "var(--cg-accent)" }} />
            <span className="font-semibold text-sm">Repair Plan</span>
          </div>
          <button
            type="button"
            onClick={cancelRepair}
            className="p-1 border-none bg-transparent cursor-pointer"
            style={{ color: "var(--cg-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto cg-scrollbar text-sm">
          <Section label="Root cause" value={currentRepairPlan.rootCause} />
          <Section label="Minimal patch" value={currentRepairPlan.minimalPatch} />
          <Section label="Repair boundary" value={currentRepairPlan.repairBoundary} />
          <div>
            <div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cg-text-muted)" }}>
              Files changed
            </div>
            <ul className="list-none m-0 p-0 space-y-0.5">
              {currentRepairPlan.filesChanged.map((f) => (
                <li key={f} className="font-mono text-xs" style={{ color: "var(--cg-accent)" }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cg-text-muted)" }}>
                Risk level
              </div>
              <span className={`cg-badge cg-badge-${currentRepairPlan.riskLevel === "low" ? "low" : "medium"}`}>
                {currentRepairPlan.riskLevel}
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cg-text-muted)" }}>
                Verification
              </div>
              <code className="text-xs font-mono">{currentRepairPlan.verificationCommand}</code>
            </div>
          </div>
          <Section label="Expected impact" value={currentRepairPlan.expectedImpact} />

          {currentDiff && (
            <div>
              <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--cg-text-muted)" }}>
                Diff preview
              </div>
              <DiffPreview diff={currentDiff} />
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--cg-border)" }}
        >
          <button type="button" onClick={cancelRepair} className="cg-btn-secondary text-xs">
            Cancel
          </button>
          <button type="button" onClick={applyPatch} className="cg-btn-primary text-xs">
            Apply Patch
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cg-text-muted)" }}>
        {label}
      </div>
      <p className="m-0 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

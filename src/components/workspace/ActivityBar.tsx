"use client";

import {
  Files,
  AlertTriangle,
  Wrench,
  FileText,
  Settings,
} from "lucide-react";
import { ActivityView, useWorkspace } from "./WorkspaceContext";

const items: { id: ActivityView; icon: typeof Files; label: string }[] = [
  { id: "explorer", icon: Files, label: "Explorer" },
  { id: "diagnostics", icon: AlertTriangle, label: "Diagnostics" },
  { id: "repairs", icon: Wrench, label: "Repairs" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function ActivityBar() {
  const { activityView, setActivityView, issues } = useWorkspace();

  return (
    <nav
      className="flex flex-col items-center py-2 w-12 shrink-0 border-r"
      style={{
        background: "var(--cg-activity-bar)",
        borderColor: "var(--cg-border)",
      }}
    >
      {items.map(({ id, icon: Icon, label }) => {
        const active = activityView === id;
        const badge = id === "diagnostics" && issues.length > 0 ? issues.length : null;

        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setActivityView(id)}
            className="relative flex items-center justify-center w-10 h-10 mb-1 rounded-md border-none cursor-pointer transition-colors"
            style={{
              background: active ? "var(--cg-bg-hover)" : "transparent",
              color: active ? "var(--cg-text)" : "var(--cg-text-muted)",
              borderLeft: active ? "2px solid var(--cg-accent)" : "2px solid transparent",
            }}
          >
            <Icon className="w-5 h-5" />
            {badge !== null && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: "var(--cg-error)", color: "#fff" }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

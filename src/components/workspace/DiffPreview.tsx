"use client";

import { DiffHunk } from "@/lib/mockData";
import { Minus, Plus } from "lucide-react";

interface DiffPreviewProps {
  diff: DiffHunk;
}

export function DiffPreview({ diff }: DiffPreviewProps) {
  return (
    <div
      className="rounded-md border overflow-hidden text-xs font-mono"
      style={{ borderColor: "var(--cg-border)" }}
    >
      <div
        className="px-3 py-1.5 font-sans font-medium text-[11px]"
        style={{ background: "var(--cg-bg-tertiary)", color: "var(--cg-text-muted)" }}
      >
        File: {diff.file}
      </div>
      <div className="p-0">
        {diff.removed.map((line, i) => (
          <div
            key={`r-${i}`}
            className="flex items-start gap-2 px-3 py-0.5"
            style={{
              background: "color-mix(in srgb, var(--cg-error) 12%, transparent)",
              color: "var(--cg-error)",
            }}
          >
            <Minus className="w-3 h-3 shrink-0 mt-0.5" />
            <span>{line}</span>
          </div>
        ))}
        {diff.added.map((line, i) => (
          <div
            key={`a-${i}`}
            className="flex items-start gap-2 px-3 py-0.5"
            style={{
              background: "color-mix(in srgb, var(--cg-success) 12%, transparent)",
              color: "var(--cg-success)",
            }}
          >
            <Plus className="w-3 h-3 shrink-0 mt-0.5" />
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

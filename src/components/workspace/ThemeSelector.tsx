"use client";

import { themes, ThemeId } from "@/lib/themes";
import { useTheme } from "@/hooks/useTheme";
import { Palette, ChevronLeft, ChevronRight } from "lucide-react";

export function ThemeSelector() {
  const { themeId, setThemeId } = useTheme();
  const currentIndex = themes.findIndex((t) => t.id === themeId);

  function cycleTheme(direction: 1 | -1) {
    const nextIndex = (currentIndex + direction + themes.length) % themes.length;
    setThemeId(themes[nextIndex].id as ThemeId);
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md px-1 py-0.5" style={{ background: "var(--cg-bg-tertiary)" }}>
      <Palette className="w-3.5 h-3.5" style={{ color: "var(--cg-accent)" }} />
      <span className="text-[11px]" style={{ color: "var(--cg-text-muted)" }}>
        Theme
      </span>
      <button
        type="button"
        onClick={() => cycleTheme(-1)}
        className="border-none bg-transparent cursor-pointer p-0.5"
        style={{ color: "var(--cg-text-muted)" }}
        title="Previous theme"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <select
        value={themeId}
        onChange={(e) => setThemeId(e.target.value as ThemeId)}
        className="text-xs rounded border px-2 py-1 cursor-pointer min-w-[140px]"
        style={{
          background: "var(--cg-input-bg)",
          borderColor: "var(--cg-border)",
          color: "var(--cg-text)",
        }}
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => cycleTheme(1)}
        className="border-none bg-transparent cursor-pointer p-0.5"
        style={{ color: "var(--cg-text-muted)" }}
        title="Next theme"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

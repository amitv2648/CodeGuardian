"use client";

import { themes, ThemeId } from "@/lib/themes";
import { useTheme } from "@/hooks/useTheme";
import { Palette } from "lucide-react";

export function ThemeSelector() {
  const { themeId, setThemeId } = useTheme();

  return (
    <div className="flex items-center gap-1.5">
      <Palette className="w-3.5 h-3.5" style={{ color: "var(--cg-text-muted)" }} />
      <select
        value={themeId}
        onChange={(e) => setThemeId(e.target.value as ThemeId)}
        className="text-xs rounded border px-2 py-1 cursor-pointer"
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
    </div>
  );
}

export type ThemeId = "guardian-dark" | "midnight" | "light" | "high-contrast";

export interface Theme {
  id: ThemeId;
  name: string;
  monacoTheme: string;
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    id: "guardian-dark",
    name: "Guardian Dark",
    monacoTheme: "vs-dark",
    vars: {
      "--cg-bg": "#0d1117",
      "--cg-bg-secondary": "#161b22",
      "--cg-bg-tertiary": "#1c2128",
      "--cg-bg-hover": "#21262d",
      "--cg-border": "#30363d",
      "--cg-text": "#e6edf3",
      "--cg-text-muted": "#8b949e",
      "--cg-accent": "#58a6ff",
      "--cg-accent-hover": "#79b8ff",
      "--cg-success": "#3fb950",
      "--cg-warning": "#d29922",
      "--cg-error": "#f85149",
      "--cg-badge-bg": "#1f2937",
      "--cg-panel-header": "#161b22",
      "--cg-status-bar": "#0d1117",
      "--cg-activity-bar": "#010409",
      "--cg-input-bg": "#0d1117",
      "--cg-button-primary": "#238636",
      "--cg-button-primary-hover": "#2ea043",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    monacoTheme: "vs-dark",
    vars: {
      "--cg-bg": "#0a0e1a",
      "--cg-bg-secondary": "#111827",
      "--cg-bg-tertiary": "#1a2235",
      "--cg-bg-hover": "#243049",
      "--cg-border": "#2d3a52",
      "--cg-text": "#e2e8f0",
      "--cg-text-muted": "#94a3b8",
      "--cg-accent": "#818cf8",
      "--cg-accent-hover": "#a5b4fc",
      "--cg-success": "#34d399",
      "--cg-warning": "#fbbf24",
      "--cg-error": "#f87171",
      "--cg-badge-bg": "#1e293b",
      "--cg-panel-header": "#111827",
      "--cg-status-bar": "#0a0e1a",
      "--cg-activity-bar": "#060912",
      "--cg-input-bg": "#0a0e1a",
      "--cg-button-primary": "#6366f1",
      "--cg-button-primary-hover": "#818cf8",
    },
  },
  {
    id: "light",
    name: "Light",
    monacoTheme: "vs",
    vars: {
      "--cg-bg": "#ffffff",
      "--cg-bg-secondary": "#f6f8fa",
      "--cg-bg-tertiary": "#eef1f5",
      "--cg-bg-hover": "#e8ecf0",
      "--cg-border": "#d0d7de",
      "--cg-text": "#1f2328",
      "--cg-text-muted": "#656d76",
      "--cg-accent": "#0969da",
      "--cg-accent-hover": "#0550ae",
      "--cg-success": "#1a7f37",
      "--cg-warning": "#9a6700",
      "--cg-error": "#cf222e",
      "--cg-badge-bg": "#eaeef2",
      "--cg-panel-header": "#f6f8fa",
      "--cg-status-bar": "#f6f8fa",
      "--cg-activity-bar": "#24292f",
      "--cg-input-bg": "#ffffff",
      "--cg-button-primary": "#1f883d",
      "--cg-button-primary-hover": "#1a7f37",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    monacoTheme: "hc-black",
    vars: {
      "--cg-bg": "#000000",
      "--cg-bg-secondary": "#0a0a0a",
      "--cg-bg-tertiary": "#141414",
      "--cg-bg-hover": "#1f1f1f",
      "--cg-border": "#ffffff",
      "--cg-text": "#ffffff",
      "--cg-text-muted": "#cccccc",
      "--cg-accent": "#00ffff",
      "--cg-accent-hover": "#66ffff",
      "--cg-success": "#00ff00",
      "--cg-warning": "#ffff00",
      "--cg-error": "#ff4444",
      "--cg-badge-bg": "#1a1a1a",
      "--cg-panel-header": "#0a0a0a",
      "--cg-status-bar": "#000000",
      "--cg-activity-bar": "#000000",
      "--cg-input-bg": "#000000",
      "--cg-button-primary": "#00ff00",
      "--cg-button-primary-hover": "#66ff66",
    },
  },
];

export function getTheme(id: ThemeId): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.setAttribute("data-theme", theme.id);
}

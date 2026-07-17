"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Theme, ThemeId, themes, applyTheme, getTheme } from "@/lib/themes";

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  themeId: "guardian-dark",
  setThemeId: () => {},
});

const STORAGE_KEY = "codeguardian-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("guardian-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && themes.some((t) => t.id === stored)) {
      setThemeIdState(stored);
    }
    setMounted(true);
  }, []);

  const theme = getTheme(themeId);

  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeId);
    }
  }, [theme, themeId, mounted]);

  const setThemeId = (id: ThemeId) => setThemeIdState(id);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

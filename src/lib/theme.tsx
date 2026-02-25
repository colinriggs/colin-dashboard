"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export const THEMES = ["midnight", "ember", "forest", "arctic"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_META: Record<Theme, { label: string; color: string; description: string }> = {
  midnight: { label: "Midnight", color: "#3b82f6", description: "Dark zinc with blue accents" },
  ember:    { label: "Ember",    color: "#f59e0b", description: "Dark stone with amber accents" },
  forest:   { label: "Forest",   color: "#10b981", description: "Dark green with emerald accents" },
  arctic:   { label: "Arctic",   color: "#0ea5e9", description: "Light slate with sky accents" },
};

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "colin-dashboard-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "midnight";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored as Theme)) return stored as Theme;
  } catch {}
  return "midnight";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    // Also toggle the 'dark' class for shadcn compatibility
    if (theme === "arctic") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  // Prevent flash by not rendering until mounted
  // But still render children — just apply default theme via CSS
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

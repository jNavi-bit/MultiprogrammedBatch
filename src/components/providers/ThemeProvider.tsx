"use client";

import * as React from "react";

export type ThemeName = "light" | "dark" | "system";

const STORAGE_KEY = "so-multiprogrammedbatch-theme";

function readSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(theme: ThemeName): "light" | "dark" {
  return theme === "system" ? readSystem() : theme;
}

function applyToDocument(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

type ThemeContextValue = {
  theme: ThemeName;
  resolvedTheme: "light" | "dark";
  setTheme: (next: ThemeName) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  const hasReadStorage = React.useRef(false);

  React.useLayoutEffect(() => {
    let active: ThemeName = theme;

    if (!hasReadStorage.current) {
      hasReadStorage.current = true;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === "light" || raw === "dark" || raw === "system") {
          active = raw;
        }
      } catch {}
      if (active !== theme) {
        setThemeState(active);
        return;
      }
    }

    const resolved = resolve(active);
    applyToDocument(resolved);
    setResolvedTheme(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, active);
    } catch {}
  }, [theme]);

  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = resolve("system");
      applyToDocument(resolved);
      setResolvedTheme(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((next: ThemeName) => {
    setThemeState(next);
  }, []);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  return {
    theme: ctx?.theme,
    resolvedTheme: ctx?.resolvedTheme,
    themes: ["light", "dark", "system"] as const,
    setTheme: (value: string) => {
      if (value === "light" || value === "dark" || value === "system") {
        ctx?.setTheme(value);
      }
    },
  };
}

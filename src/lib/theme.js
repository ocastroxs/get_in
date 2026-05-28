"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme-config";

const THEME_OPTIONS = ["light", "dark", "system"];

const normalizeTheme = (theme) => (THEME_OPTIONS.includes(theme) ? theme : DEFAULT_THEME);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return DEFAULT_THEME === "light" ? "light" : "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (theme) => {
  const normalizedTheme = normalizeTheme(theme);
  return normalizedTheme === "system" ? getSystemTheme() : normalizedTheme;
};

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = normalizeTheme(savedTheme);

  if (!savedTheme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  return theme;
}

export function applyTheme(theme = getStoredTheme()) {
  if (typeof document === "undefined") {
    return {
      theme: DEFAULT_THEME,
      resolvedTheme: DEFAULT_THEME === "light" ? "light" : "dark",
      isDark: DEFAULT_THEME !== "light",
    };
  }

  const normalizedTheme = normalizeTheme(theme);
  const resolvedTheme = resolveTheme(normalizedTheme);
  const isDark = resolvedTheme === "dark";
  const result = { theme: normalizedTheme, resolvedTheme, isDark };

  document.documentElement.classList.toggle("dark", isDark);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: result }));
  }

  return result;
}

function getCurrentTheme() {
  return getStoredTheme();
}

export function useAppTheme() {
  const [theme, setThemeState] = useState(getCurrentTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getCurrentTheme()));

  const setTheme = useCallback((nextTheme) => {
    const normalizedTheme = normalizeTheme(nextTheme);
    const result = applyTheme(normalizedTheme);

    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    setThemeState(result.theme);
    setResolvedTheme(result.resolvedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    const handleThemeChanged = (event) => {
      const detail = event.detail;
      const nextTheme =
        typeof detail === "object" && detail?.theme
          ? normalizeTheme(detail.theme)
          : normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
      const nextResolvedTheme =
        typeof detail === "object" && detail?.resolvedTheme
          ? detail.resolvedTheme
          : detail
            ? "dark"
            : resolveTheme(nextTheme);

      setThemeState(nextTheme);
      setResolvedTheme(nextResolvedTheme);
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        const result = applyTheme(event.newValue || DEFAULT_THEME);
        setThemeState(result.theme);
        setResolvedTheme(result.resolvedTheme);
      }
    };

    const handleSystemThemeChange = () => {
      if (getStoredTheme() === "system") {
        const result = applyTheme("system");
        setThemeState(result.theme);
        setResolvedTheme(result.resolvedTheme);
      }
    };

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

    window.addEventListener("themeChanged", handleThemeChanged);
    window.addEventListener("storage", handleStorage);
    mediaQuery?.addEventListener?.("change", handleSystemThemeChange);

    queueMicrotask(() => {
      const result = applyTheme(getStoredTheme());
      setThemeState(result.theme);
      setResolvedTheme(result.resolvedTheme);
    });

    return () => {
      window.removeEventListener("themeChanged", handleThemeChanged);
      window.removeEventListener("storage", handleStorage);
      mediaQuery?.removeEventListener?.("change", handleSystemThemeChange);
    };
  }, []);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setTheme,
    toggleTheme,
  };
}

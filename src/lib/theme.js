"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme-config";

const normalizeTheme = (theme) => (theme === "light" ? "light" : DEFAULT_THEME);

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : DEFAULT_THEME;

  if (!savedTheme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  return theme;
}

export function applyTheme(theme = getStoredTheme()) {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  const normalizedTheme = normalizeTheme(theme);
  const isDark = normalizedTheme === "dark";

  document.documentElement.classList.toggle("dark", isDark);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: isDark }));
  }

  return normalizedTheme;
}

function getCurrentTheme() {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useAppTheme() {
  const [theme, setThemeState] = useState(getCurrentTheme);

  const setTheme = useCallback((nextTheme) => {
    const normalizedTheme = normalizeTheme(nextTheme);

    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    setThemeState(applyTheme(normalizedTheme));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    const handleThemeChanged = (event) => {
      setThemeState(event.detail ? "dark" : "light");
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeState(applyTheme(event.newValue || DEFAULT_THEME));
      }
    };

    window.addEventListener("themeChanged", handleThemeChanged);
    window.addEventListener("storage", handleStorage);
    queueMicrotask(() => applyTheme(getStoredTheme()));

    return () => {
      window.removeEventListener("themeChanged", handleThemeChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme,
  };
}

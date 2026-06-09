import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme-config";

export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var savedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "${DEFAULT_THEME}";
    var resolvedTheme = theme === "system" && window.matchMedia
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    if (!savedTheme) {
      localStorage.setItem("${THEME_STORAGE_KEY}", theme);
    }

    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  } catch (error) {
    document.documentElement.classList.add("dark");
  }
})();
`;


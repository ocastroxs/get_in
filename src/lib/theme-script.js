import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme-config";

export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var savedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "${DEFAULT_THEME}";

    if (!savedTheme) {
      localStorage.setItem("${THEME_STORAGE_KEY}", theme);
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (error) {
    document.documentElement.classList.add("dark");
  }
})();
`;


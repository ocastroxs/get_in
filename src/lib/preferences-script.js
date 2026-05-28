import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from "@/lib/preferences-config";

export const PREFERENCES_INIT_SCRIPT = `
(function() {
  try {
    var defaults = ${JSON.stringify(DEFAULT_PREFERENCES)};
    var rawPreferences = localStorage.getItem("${PREFERENCES_STORAGE_KEY}");
    var preferences = rawPreferences ? JSON.parse(rawPreferences) : defaults;
    var density = preferences && preferences.densidade === "compacta" ? "compacta" : defaults.densidade;
    var sidebar = preferences && preferences.menuLateral === "recolhido" ? "recolhido" : defaults.menuLateral;
    var language = preferences && ["pt-BR", "en-US", "es-ES"].indexOf(preferences.idioma) >= 0 ? preferences.idioma : defaults.idioma;
    var reduceMotion = Boolean(preferences && preferences.reduzirMovimento);

    document.documentElement.lang = language.toLowerCase();
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.sidebarDefault = sidebar;
    document.documentElement.dataset.language = language;
    document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  } catch (error) {
    document.documentElement.dataset.density = "${DEFAULT_PREFERENCES.densidade}";
    document.documentElement.dataset.sidebarDefault = "${DEFAULT_PREFERENCES.menuLateral}";
    document.documentElement.dataset.language = "${DEFAULT_PREFERENCES.idioma}";
    document.documentElement.dataset.reduceMotion = "false";
  }
})();
`;

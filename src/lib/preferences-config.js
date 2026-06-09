import { DEFAULT_THEME } from "@/lib/theme-config";

export const PREFERENCES_STORAGE_KEY = "getin_user_preferences";

export const DEFAULT_PREFERENCES = {
  tema: DEFAULT_THEME,
  idioma: "pt-BR",
  densidade: "confortavel",
  menuLateral: "expandido",
  reduzirMovimento: false,
  confirmarAcoesCriticas: true,
};

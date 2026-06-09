"use client";

import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from "@/lib/preferences-config";
import { normalizeLanguage, setDocumentLanguage } from "@/lib/i18n-core";
import { applyTheme } from "@/lib/theme";
import { THEME_STORAGE_KEY } from "@/lib/theme-config";

export const PREFERENCES_CHANGED_EVENT = "preferencesChanged";

function normalizeChoice(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizePreferences(preferences = {}) {
  const payload = preferences && typeof preferences === "object" ? preferences : {};

  return {
    tema: normalizeChoice(payload.tema, ["dark", "light", "system"], DEFAULT_PREFERENCES.tema),
    idioma: normalizeLanguage(payload.idioma),
    densidade: normalizeChoice(payload.densidade, ["confortavel", "compacta"], DEFAULT_PREFERENCES.densidade),
    menuLateral: normalizeChoice(payload.menuLateral, ["expandido", "recolhido"], DEFAULT_PREFERENCES.menuLateral),
    reduzirMovimento: normalizeBoolean(payload.reduzirMovimento, DEFAULT_PREFERENCES.reduzirMovimento),
    confirmarAcoesCriticas: normalizeBoolean(
      payload.confirmarAcoesCriticas,
      DEFAULT_PREFERENCES.confirmarAcoesCriticas
    ),
  };
}

export function getStoredPreferences() {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const storedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return storedPreferences
      ? normalizePreferences(JSON.parse(storedPreferences))
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function applyPreferences(preferences) {
  const normalizedPreferences = normalizePreferences(preferences);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.density = normalizedPreferences.densidade;
    document.documentElement.dataset.sidebarDefault = normalizedPreferences.menuLateral;
    document.documentElement.dataset.reduceMotion = normalizedPreferences.reduzirMovimento ? "true" : "false";
    document.documentElement.classList.toggle("reduce-motion", normalizedPreferences.reduzirMovimento);
  }

  applyTheme(normalizedPreferences.tema);
  setDocumentLanguage(normalizedPreferences.idioma);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(PREFERENCES_CHANGED_EVENT, { detail: normalizedPreferences })
    );
  }

  return normalizedPreferences;
}

export function savePreferencesToStorage(preferences) {
  const normalizedPreferences = normalizePreferences(preferences);

  if (typeof window !== "undefined") {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalizedPreferences));
    localStorage.setItem(THEME_STORAGE_KEY, normalizedPreferences.tema);
  }

  return applyPreferences(normalizedPreferences);
}

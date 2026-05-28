"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  compareText,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  getActiveLanguage,
  normalizeLanguage,
  setDocumentLanguage,
  t as translateKey,
  translateText,
} from "@/lib/i18n-core";
import { getStoredPreferences, PREFERENCES_CHANGED_EVENT } from "@/lib/preferences";
import { PREFERENCES_STORAGE_KEY } from "@/lib/preferences-config";

const I18nContext = createContext(null);
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"];
const SKIP_SELECTOR = "script,style,noscript,code,pre,textarea,[data-i18n-skip='true']";

function shouldSkipNode(node) {
  const parent = node?.parentElement;
  return !parent || Boolean(parent.closest(SKIP_SELECTOR));
}

function translateTextNode(node, language) {
  if (shouldSkipNode(node)) {
    return;
  }

  const nextValue = translateText(node.nodeValue, language);

  if (nextValue !== node.nodeValue) {
    node.nodeValue = nextValue;
  }
}

function translateElementAttributes(element, language) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE || element.closest(SKIP_SELECTOR)) {
    return;
  }

  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    if (!element.hasAttribute(attribute)) {
      continue;
    }

    const currentValue = element.getAttribute(attribute);
    const nextValue = translateText(currentValue, language);

    if (nextValue !== currentValue) {
      element.setAttribute(attribute, nextValue);
    }
  }
}

function translateTree(root, language) {
  if (typeof document === "undefined" || !root) {
    return;
  }

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language);
    return;
  }

  const elementRoot = root.nodeType === Node.ELEMENT_NODE ? root : document.body;

  if (!elementRoot) {
    return;
  }

  translateElementAttributes(elementRoot, language);
  elementRoot
    .querySelectorAll(TRANSLATABLE_ATTRIBUTES.map((attr) => `[${attr}]`).join(","))
    .forEach((element) => translateElementAttributes(element, language));

  const walker = document.createTreeWalker(elementRoot, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipNode(node) || !node.nodeValue?.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => translateTextNode(node, language));
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getActiveLanguage);

  const applyLanguage = useCallback((nextLanguage) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);
    setLanguage(normalizedLanguage);
    setDocumentLanguage(normalizedLanguage);
    queueMicrotask(() => translateTree(document.body, normalizedLanguage));
  }, []);

  useEffect(() => {
    queueMicrotask(() => applyLanguage(getStoredPreferences().idioma));

    const handlePreferencesChanged = (event) => {
      applyLanguage(event.detail?.idioma || getStoredPreferences().idioma);
    };

    const handleStorage = (event) => {
      if (event.key === PREFERENCES_STORAGE_KEY) {
        applyLanguage(getStoredPreferences().idioma);
      }
    };

    window.addEventListener(PREFERENCES_CHANGED_EVENT, handlePreferencesChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(PREFERENCES_CHANGED_EVENT, handlePreferencesChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [applyLanguage]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const nativeAlert = window.alert;
    const nativeConfirm = window.confirm;

    window.alert = (message) => nativeAlert(translateText(message, getActiveLanguage()));
    window.confirm = (message) => nativeConfirm(translateText(message, getActiveLanguage()));

    return () => {
      window.alert = nativeAlert;
      window.confirm = nativeConfirm;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) {
      return undefined;
    }

    translateTree(document.body, language);

    let translating = false;
    const observer = new MutationObserver((mutations) => {
      if (translating) {
        return;
      }

      translating = true;
      queueMicrotask(() => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            translateTextNode(mutation.target, language);
          }

          if (mutation.type === "attributes") {
            translateElementAttributes(mutation.target, language);
          }

          mutation.addedNodes.forEach((node) => translateTree(node, language));
        }

        translating = false;
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      t: (key, params) => translateKey(key, params, language),
      translateText: (text, params) => translateText(text, language, params),
      formatDate: (valueToFormat, options) => formatDate(valueToFormat, options, language),
      formatDateTime: (valueToFormat, options) => formatDateTime(valueToFormat, options, language),
      formatTime: (valueToFormat, options) => formatTime(valueToFormat, options, language),
      formatNumber: (valueToFormat, options) => formatNumber(valueToFormat, options, language),
      compareText: (a, b) => compareText(a, b, language),
      setLanguage: applyLanguage,
    }),
    [applyLanguage, language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n deve ser usado dentro de I18nProvider");
  }

  return context;
}

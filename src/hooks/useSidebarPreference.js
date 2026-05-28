"use client";

import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_CHANGED_EVENT } from "@/lib/preferences";
import { PREFERENCES_STORAGE_KEY } from "@/lib/preferences-config";

function getInitialExpandedState() {
  return getStoredPreferences().menuLateral !== "recolhido";
}

export function useSidebarPreference() {
  const [isExpanded, setIsExpanded] = useState(getInitialExpandedState);

  useEffect(() => {
    const handlePreferencesChanged = (event) => {
      const nextPreferences = event.detail || getStoredPreferences();
      setIsExpanded(nextPreferences.menuLateral !== "recolhido");
    };

    const handleStorage = (event) => {
      if (event.key === PREFERENCES_STORAGE_KEY) {
        setIsExpanded(getInitialExpandedState());
      }
    };

    window.addEventListener(PREFERENCES_CHANGED_EVENT, handlePreferencesChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(PREFERENCES_CHANGED_EVENT, handlePreferencesChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return [isExpanded, setIsExpanded];
}

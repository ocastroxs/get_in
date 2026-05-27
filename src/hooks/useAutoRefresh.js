"use client";

import { useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 15000;

export function useAutoRefresh(callback, options = {}) {
  const {
    enabled = true,
    immediate = true,
    intervalMs = DEFAULT_INTERVAL_MS,
  } = options;
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || typeof callbackRef.current !== "function") return undefined;

    let mounted = true;

    async function refresh({ silent = false } = {}) {
      if (!mounted || runningRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;

      runningRef.current = true;
      try {
        await callbackRef.current({ silent, auto: silent });
      } finally {
        runningRef.current = false;
      }
    }

    if (immediate) {
      refresh();
    }

    const interval = window.setInterval(() => refresh({ silent: true }), intervalMs);
    const handleFocus = () => refresh({ silent: true });
    const handleVisibilityChange = () => {
      if (!document.hidden) refresh({ silent: true });
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, immediate, intervalMs]);
}

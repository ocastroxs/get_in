"use client";

import { useEffect } from "react";

export default function ConsoleWarningSuppressor({ children }) {
  useEffect(() => {
    const originalWarn = console.warn;

    console.warn = (...args) => {
      const message = args.join(" ");
      if (message.includes("The width(-1) and height(-1) of chart should be greater than 0")) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return <>{children}</>;
}

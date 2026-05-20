"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteChangeIndicator() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleClick = (event) => {
      const anchor = event.target.closest?.("a[href]");

      if (!anchor || anchor.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      const url = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
        setVisible(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(timeout);
  }, [pathname, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10">
      <div className="h-full w-1/3 animate-[route-progress_0.75s_ease-in-out_infinite] rounded-r-full bg-primary shadow-[0_0_18px_rgba(15,58,125,0.35)]" />
    </div>
  );
}

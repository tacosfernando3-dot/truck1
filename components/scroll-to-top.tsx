"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Scroll to the top on every route change (keep hash targets when present). */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        // Defer so layout/header offset settles after navigation.
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start" });
        });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

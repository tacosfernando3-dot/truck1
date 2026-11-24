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
      // Menu category deep-links are handled by MenuFilter with sticky offset.
      if (hash.startsWith("menu-")) return;

      const target = document.getElementById(hash);
      if (target) {
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

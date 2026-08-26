"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n";

const SESSION_KEY = "street-crave-preloader-seen";
const MIN_MS = 1400;

function subscribe() {
  return () => {};
}

function getPreloaderVisible(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

export function SitePreloader() {
  const t = useT();
  const shouldShow = useSyncExternalStore(
    subscribe,
    getPreloaderVisible,
    () => true,
  );
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const visible = shouldShow && !finished;

  useEffect(() => {
    if (!shouldShow) return;

    const started = Date.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_MS - (Date.now() - started));
      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => {
          setFinished(true);
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // ignore
          }
        }, 450);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      window.setTimeout(finish, 2800);
    }

    return () => window.removeEventListener("load", finish);
  }, [shouldShow]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={t("preloader.loading")}
    >
      <div className="preloader-logo relative px-8">
        <Image
          src="/images/los-compadres-banner.png"
          alt={t("preloader.alt")}
          width={1018}
          height={395}
          priority
          className="h-auto w-[min(78vw,320px)] object-contain sm:w-[360px]"
        />
      </div>

      <div className="mt-10 h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="preloader-bar h-full w-1/2 rounded-full bg-gold" />
      </div>

      <p className="mt-4 text-xs font-semibold tracking-[0.28em] text-muted uppercase">
        {t("preloader.flavor")}
      </p>
    </div>
  );
}

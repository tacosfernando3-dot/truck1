"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/button";
import { primaryNav } from "@/data/navigation";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

export function MobileNavigation({ open, onClose, pathname }: Props) {
  const t = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Close when the route changes after the first paint.
  const isFirstPath = useRef(true);
  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pathname-driven close only
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 animate-fade-in"
        aria-label={t("nav.closeMenuOverlay")}
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-background-soft shadow-2xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.mobileNav")}
      >
        <div className="flex items-center justify-between border-b border-border-dark px-5 py-4">
          <Logo onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white hover:bg-surface-dark"
            aria-label={t("nav.closeMenu")}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-6" aria-label={t("nav.mobile")}>
          {primaryNav.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "rounded-md px-4 py-3 text-base font-semibold tracking-wide uppercase",
                  active ? "bg-surface-dark text-yellow" : "text-white hover:bg-surface-dark",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border-dark p-5">
          <Button href="/menu" className="w-full" onClick={onClose}>
            {t("nav.orderNow")}
          </Button>
        </div>
      </aside>
    </div>
  );
}

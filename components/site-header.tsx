"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/button";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileNavigation } from "@/components/mobile-navigation";
import { useCart } from "@/components/cart-provider";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "nav.home" },
  { href: "/menu", key: "nav.menu" },
  { href: "/locations", key: "nav.locations" },
  { href: "/catering", key: "nav.catering" },
  { href: "/#about", key: "nav.about" },
  { href: "/#contact", key: "nav.contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b border-border-dark transition-all duration-300",
          scrolled
            ? "bg-background/95 shadow-lg shadow-black/40 backdrop-blur-md"
            : "bg-background/90 backdrop-blur-sm",
        )}
      >
        <div className="container-site flex h-[68px] items-center justify-between gap-4 lg:h-[78px]">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <LanguageToggle />
            </div>
            <div className="hidden lg:block">
              <Logo />
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.main")}>
            {navItems.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : link.href.startsWith("/#")
                    ? false
                    : pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium tracking-wide uppercase transition",
                    active ? "text-yellow" : "text-muted hover:text-white",
                  )}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:block">
              <LanguageToggle />
            </div>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white hover:bg-surface-dark"
              aria-label={t("nav.openCart", { count: cartCount })}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow px-1 text-[10px] font-bold text-background">
                  {cartCount}
                </span>
              )}
            </button>

            <Button href="/menu" className="hidden sm:inline-flex">
              {t("nav.orderNow")}
            </Button>

            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white hover:bg-surface-dark lg:hidden"
              aria-label={t("nav.openMenu")}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="h-[68px] shrink-0 lg:h-[78px]" aria-hidden />

      <MobileNavigation
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

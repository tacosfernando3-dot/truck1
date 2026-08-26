"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/button";
import { useContact } from "@/components/contact-provider";
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
  { href: "/#contact", key: "nav.contact", action: "contact" as const },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const { openContact } = useContact();
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
          "site-header-fixed fixed inset-x-0 top-0 z-40 border-b border-border-dark transition-colors duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md"
            : "bg-background/90 backdrop-blur-sm",
        )}
      >
        <div className="container-site flex h-[68px] items-center gap-4 lg:h-[78px]">
          <Logo imageClassName="h-9 sm:h-11" className="shrink-0" />

          <nav
            className="ml-2 hidden flex-1 items-center justify-center gap-1 lg:flex"
            aria-label={t("nav.main")}
          >
            {navItems.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : link.href.startsWith("/#")
                    ? false
                    : pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);
              const className = cn(
                "px-3 py-2 text-sm font-semibold tracking-wide uppercase transition",
                active ? "text-gold" : "text-muted hover:text-white",
              );

              if ("action" in link && link.action === "contact") {
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={openContact}
                    className={className}
                  >
                    {t(link.key)}
                  </button>
                );
              }

              return (
                <Link key={link.href} href={link.href} className={className}>
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageToggle />

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-surface-dark hover:text-gold sm:h-11 sm:w-11"
              aria-label={t("nav.openCart", { count: cartCount })}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-md bg-yellow px-1 text-[10px] font-bold text-white sm:right-1 sm:top-1">
                  {cartCount}
                </span>
              )}
            </button>

            <Button
              href="/menu"
              className="h-9 min-h-0 px-3 text-xs hover:!bg-green sm:h-11 sm:px-5 sm:text-sm"
            >
              {t("nav.orderNow")}
            </Button>

            <button
              type="button"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-surface-dark sm:h-11 sm:w-11 lg:hidden"
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

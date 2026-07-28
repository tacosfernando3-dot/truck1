"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { NewsletterSection } from "@/components/newsletter-section";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/social-icons";
import { business } from "@/data/locations";
import { footerInfo, footerPages } from "@/data/navigation";
import { cn } from "@/lib/utils";

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-dark py-3 md:border-0 md:py-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-left md:pointer-events-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3 className="font-display text-lg tracking-wide text-yellow uppercase">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition md:hidden",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div className={cn("mt-3 space-y-2 md:block", open ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-border-dark bg-background">
      <div className="container-site grid gap-8 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Bold flavor on wheels. Catch us in Jackson Heights, Queens and book
            us for your next event.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-dark hover:border-yellow hover:text-yellow"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={business.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-dark hover:border-yellow hover:text-yellow"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href={business.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-dark hover:border-yellow hover:text-yellow"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <FooterGroup title="Pages">
          {footerPages.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="block text-sm text-muted hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </FooterGroup>

        <FooterGroup title="Info">
          {footerInfo.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="block text-sm text-muted hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </FooterGroup>

        <div>
          <NewsletterSection compact />
        </div>
      </div>

      <div className="border-t border-border-dark">
        <div className="container-site flex flex-col gap-3 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {business.name}. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/#contact" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/#contact" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

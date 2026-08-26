"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BusinessContactDetails } from "@/components/business-contact-details";
import { useContent } from "@/components/content-provider";
import { Logo } from "@/components/logo";
import { NewsletterSection } from "@/components/newsletter-section";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/social-icons";
import { footerInfo, footerPages } from "@/data/navigation";
import { useT } from "@/lib/i18n";
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
    <div className="min-w-0 border-b border-border-dark py-3 md:border-0 md:py-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-left md:pointer-events-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3 className="font-display text-lg tracking-wide text-red uppercase">
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
  const t = useT();
  const { content } = useContent();
  const business = content.business;
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-border-dark bg-background">
      <div className="container-site grid gap-8 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <Logo imageClassName="h-14 sm:h-16" />
          <BusinessContactDetails
            business={business}
            className="mt-4 max-w-xs"
          />
          {(business.showInstagram ||
            business.showFacebook ||
            business.showTikTok) && (
            <div className="mt-5 flex gap-3">
              {business.showInstagram ? (
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:text-yellow"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              ) : null}
              {business.showFacebook ? (
                <a
                  href={business.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:text-yellow"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
              ) : null}
              {business.showTikTok ? (
                <a
                  href={business.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:text-yellow"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          )}
        </div>

        <FooterGroup title={t("common.pages")}>
          {footerPages.map((link) => (
            <Link
              key={link.href + link.key}
              href={link.href}
              className="block text-sm text-muted hover:text-white"
            >
              {t(link.key)}
            </Link>
          ))}
        </FooterGroup>

        <FooterGroup title={t("common.info")}>
          {footerInfo.map((link) => (
            <Link
              key={link.href + link.key}
              href={link.href}
              className="block text-sm text-muted hover:text-white"
            >
              {t(link.key)}
            </Link>
          ))}
        </FooterGroup>

        <div className="min-w-0">
          <NewsletterSection compact />
        </div>
      </div>

      <div className="border-t border-border-dark">
        <div className="container-site flex flex-col gap-3 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {business.name}. {t("common.allRights")}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              {t("common.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white">
              {t("common.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

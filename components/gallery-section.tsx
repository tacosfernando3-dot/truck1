"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useContent } from "@/components/content-provider";
import { InstagramIcon } from "@/components/social-icons";
import type { InstagramMediaItem } from "@/lib/instagram/feed";
import { getGallerySocial } from "@/lib/cms/utils";
import type { GalleryItem } from "@/lib/types";
import { useT } from "@/lib/i18n";

type GalleryTile = {
  id: string;
  image: string;
  alt: string;
  href: string;
  unoptimized: boolean;
};

function toTilesFromCms(
  gallery: GalleryItem[],
  profileUrl: string,
): GalleryTile[] {
  return gallery.map((item) => ({
    id: item.id,
    image: item.image,
    alt: item.alt,
    href: profileUrl,
    unoptimized: item.image.startsWith("/uploads/"),
  }));
}

function toTilesFromInstagram(items: InstagramMediaItem[]): GalleryTile[] {
  return items.map((item) => ({
    id: item.id,
    image: item.image,
    alt: item.alt,
    href: item.permalink || "",
    unoptimized: true,
  }));
}

export function GallerySection() {
  const t = useT();
  const { content } = useContent();
  const { business, gallery } = content;
  const social = getGallerySocial(business);
  const cmsTiles = useMemo(
    () => toTilesFromCms(gallery, social.url || "#"),
    [gallery, social.url],
  );
  const [tiles, setTiles] = useState<GalleryTile[]>(cmsTiles);
  const [fromInstagram, setFromInstagram] = useState(false);

  useEffect(() => {
    setTiles(cmsTiles);
    setFromInstagram(false);

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/instagram/feed", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          items?: InstagramMediaItem[];
        };
        if (cancelled) return;
        if (data.items && data.items.length > 0) {
          setTiles(toTilesFromInstagram(data.items));
          setFromInstagram(true);
        }
      } catch {
        /* keep CMS tiles */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cmsTiles]);

  const profileHref = social.url || "#";

  return (
    <section
      id="gallery"
      className="relative grain bg-cream py-16 text-background sm:py-20"
    >
      <div className="container-site">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-brush text-fluid-section">{t("gallery.title")}</h2>
          {social.enabled ? (
            <a
              href={profileHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold tracking-[0.18em] text-background/70 uppercase hover:text-background"
            >
              {social.handle}
            </a>
          ) : (
            <p className="mt-2 text-sm font-semibold tracking-[0.18em] text-background/70 uppercase">
              {social.handle}
            </p>
          )}
          {fromInstagram ? (
            <p className="mt-2 text-[11px] tracking-wide text-background/45 uppercase">
              Latest from Instagram
            </p>
          ) : null}
        </div>

        <div className="hidden gap-4 md:grid md:grid-cols-5">
          {tiles.map((item) => {
            const href = item.href || profileHref;
            const clickable = Boolean(href && href !== "#");
            const image = (
              <>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="20vw"
                  unoptimized={item.unoptimized}
                />
                {clickable ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                    <InstagramIcon className="h-7 w-7 text-white" />
                  </div>
                ) : null}
              </>
            );

            return clickable ? (
              <a
                key={item.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg"
                aria-label={t("gallery.viewOnSocial", {
                  alt: item.alt,
                  network: "Instagram",
                })}
              >
                {image}
              </a>
            ) : (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg"
              >
                {image}
              </div>
            );
          })}
        </div>

        <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden">
          {tiles.map((item) => {
            const href = item.href || profileHref;
            const clickable = Boolean(href && href !== "#");
            const image = (
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="78vw"
                unoptimized={item.unoptimized}
              />
            );

            return clickable ? (
              <a
                key={item.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square w-[78vw] shrink-0 snap-start overflow-hidden rounded-lg"
                aria-label={t("gallery.viewOnSocial", {
                  alt: item.alt,
                  network: "Instagram",
                })}
              >
                {image}
              </a>
            ) : (
              <div
                key={item.id}
                className="relative aspect-square w-[78vw] shrink-0 snap-start overflow-hidden rounded-lg"
              >
                {image}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs tracking-wide text-background/50 uppercase md:hidden">
          {t("gallery.swipe")}
        </p>
      </div>
    </section>
  );
}

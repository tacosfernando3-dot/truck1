"use client";

import Image from "next/image";
import { useContent } from "@/components/content-provider";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/social-icons";
import { getGallerySocial } from "@/lib/cms/utils";
import { useT } from "@/lib/i18n";

function GalleryNetworkIcon({
  network,
  className,
}: {
  network: "instagram" | "facebook" | "tiktok";
  className?: string;
}) {
  if (network === "facebook") {
    return <FacebookIcon className={className} />;
  }
  if (network === "tiktok") {
    return <TikTokIcon className={className} />;
  }
  return <InstagramIcon className={className} />;
}

export function GallerySection() {
  const t = useT();
  const { content } = useContent();
  const { business, gallery } = content;
  const social = getGallerySocial(business);

  return (
    <section id="gallery" className="relative grain bg-cream py-16 text-background sm:py-20">
      <div className="container-site">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-brush text-fluid-section">{t("gallery.title")}</h2>
          {social.enabled ? (
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold tracking-[0.18em] text-background/70 uppercase hover:text-background"
            >
              {business.handle}
            </a>
          ) : (
            <p className="mt-2 text-sm font-semibold tracking-[0.18em] text-background/70 uppercase">
              {business.handle}
            </p>
          )}
        </div>

        <div className="hidden gap-4 md:grid md:grid-cols-5">
          {gallery.map((item) => {
            const image = (
              <>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="20vw"
                  unoptimized={item.image.startsWith("/uploads/")}
                />
                {social.enabled ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                    <GalleryNetworkIcon
                      network={social.network}
                      className="h-7 w-7 text-white"
                    />
                  </div>
                ) : null}
              </>
            );

            return social.enabled ? (
              <a
                key={item.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg"
                aria-label={t("gallery.viewOnSocial", {
                  alt: item.alt,
                  network: social.label,
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
          {gallery.map((item) => {
            const image = (
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="78vw"
                unoptimized={item.image.startsWith("/uploads/")}
              />
            );

            return social.enabled ? (
              <a
                key={item.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square w-[78vw] shrink-0 snap-start overflow-hidden rounded-lg"
                aria-label={t("gallery.viewOnSocial", {
                  alt: item.alt,
                  network: social.label,
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

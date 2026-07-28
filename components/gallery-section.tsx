"use client";

import Image from "next/image";
import { InstagramIcon } from "@/components/social-icons";
import { galleryItems } from "@/data/gallery";
import { business } from "@/data/locations";
import { useT } from "@/lib/i18n";

export function GallerySection() {
  const t = useT();

  return (
    <section id="gallery" className="relative grain bg-cream py-16 text-background sm:py-20">
      <div className="container-site">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-brush text-fluid-section">{t("gallery.title")}</h2>
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-semibold tracking-[0.18em] text-background/70 uppercase hover:text-background"
          >
            {business.handle}
          </a>
        </div>

        <div className="hidden gap-4 md:grid md:grid-cols-5">
          {galleryItems.map((item) => (
            <a
              key={item.id}
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
              aria-label={t("gallery.viewOnIg", { alt: item.alt })}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="20vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                <InstagramIcon className="h-7 w-7 text-white" />
              </div>
            </a>
          ))}
        </div>

        <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden">
          {galleryItems.map((item) => (
            <a
              key={item.id}
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square w-[78vw] shrink-0 snap-start overflow-hidden rounded-lg"
              aria-label={t("gallery.viewOnIg", { alt: item.alt })}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="78vw"
              />
            </a>
          ))}
        </div>
        <p className="mt-3 text-center text-xs tracking-wide text-background/50 uppercase md:hidden">
          {t("gallery.swipe")}
        </p>
      </div>
    </section>
  );
}

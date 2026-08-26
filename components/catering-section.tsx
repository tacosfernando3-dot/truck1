"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { useContact } from "@/components/contact-provider";
import { images } from "@/data/images";
import { useT } from "@/lib/i18n";

export function CateringSection() {
  const t = useT();
  const { openContact } = useContact();

  return (
    <section id="about" className="bg-background-soft py-14 sm:py-16">
      <div className="container-site grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-gold uppercase">
            {t("about.eyebrow")}
          </p>
          <h2 className="mt-2 font-brush text-fluid-section text-white">
            {t("about.title")}
          </h2>
          <p className="mt-4 max-w-xl text-muted">{t("about.body")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              href="/catering"
              className="hover:!bg-gold hover:!text-background"
            >
              {t("about.cateringEvents")}
            </Button>
            <Button
              type="button"
              variant="outline-light"
              onClick={openContact}
            >
              {t("about.contactCrew")}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">
            {t("about.preferPackages")}{" "}
            <Link href="/catering#inquiry" className="text-yellow hover:underline">
              {t("about.seePackages")}
            </Link>
            .
          </p>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-border-dark">
          <Image
            src={images.cateringFood}
            alt={t("about.alt")}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}

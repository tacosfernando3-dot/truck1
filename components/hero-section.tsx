"use client";

import Image from "next/image";
import { MapPin, Utensils } from "lucide-react";
import { Button } from "@/components/button";
import { images } from "@/data/images";
import { useT } from "@/lib/i18n";

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src={images.heroFoodTruck}
        alt={t("hero.altTruck")}
        fill
        priority
        className="object-cover object-[85%_center] sm:object-[75%_center] lg:object-[48%_center]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/35" />

      <div className="container-site relative flex flex-col items-stretch gap-5 py-8 sm:gap-6 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-12">
        <div className="max-w-xl lg:max-w-md xl:max-w-lg">
          <p className="animate-fade-up mb-2 text-sm font-semibold tracking-[0.25em] text-yellow uppercase">
            {t("hero.eyebrow")}
          </p>
          <h1 className="animate-fade-up delay-100 font-brush text-fluid-hero">
            <span className="text-white">{t("hero.titleLine1")}</span>
            <br />
            <span className="text-yellow">{t("hero.titleLine2")}</span>
          </h1>
          <p className="animate-fade-up delay-200 mt-3 max-w-md text-base text-muted sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="animate-fade-up delay-300 mt-5 grid w-full max-w-md grid-cols-2 gap-3 lg:flex lg:max-w-none">
            <Button
              href="/menu"
              leftIcon={<Utensils className="h-4 w-4" aria-hidden />}
              className="hover:!bg-green"
            >
              {t("hero.viewMenu")}
            </Button>
            <Button
              href="/locations"
              variant="outline-light"
              leftIcon={<MapPin className="h-4 w-4" aria-hidden />}
            >
              {t("hero.findUs")}
            </Button>
          </div>
        </div>

        <div className="animate-fade-up delay-100 order-first flex justify-center lg:order-none lg:shrink-0 lg:justify-end">
          <Image
            src="/images/los-compadres-logo.png"
            alt={t("hero.altLogo")}
            width={1024}
            height={1024}
            priority
            className="h-auto w-[min(70vw,280px)] bg-transparent object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)] sm:w-[320px] lg:w-[400px] xl:w-[460px]"
          />
        </div>
      </div>
    </section>
  );
}

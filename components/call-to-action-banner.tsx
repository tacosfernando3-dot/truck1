"use client";

import { Beef } from "lucide-react";
import { Button } from "@/components/button";
import { useT } from "@/lib/i18n";

export function CallToActionBanner() {
  const t = useT();

  return (
    <section className="bg-green py-10 text-white sm:py-12">
      <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-background">
            <Beef className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="font-brush text-3xl sm:text-4xl">{t("cta.title")}</h2>
            <p className="mt-1 text-white/85">{t("cta.subtitle")}</p>
          </div>
        </div>
        <Button href="/menu" variant="secondary" className="w-full border-white/30 md:w-auto">
          {t("cta.orderNow")}
        </Button>
      </div>
    </section>
  );
}

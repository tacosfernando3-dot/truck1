"use client";

import { Button } from "@/components/button";
import { getTodaysLocation, fullAddress } from "@/data/locations";
import { useT } from "@/lib/i18n";
import { directionsUrl, mapsEmbedUrl } from "@/lib/utils";

export function LocationSection() {
  const t = useT();
  const today = getTodaysLocation();
  const address = fullAddress(today);
  const mapSrc = mapsEmbedUrl({
    lat: today.lat,
    lng: today.lng,
    query: address,
    zoom: 15,
  });

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container-site grid gap-8 lg:grid-cols-[34%_66%] lg:items-stretch">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            {t("locationHome.eyebrow")}
          </p>
          <h2 className="mt-2 font-brush text-fluid-section text-white">
            {t("locationHome.titleLine1")}
            <br />
            {t("locationHome.titleLine2")}
          </h2>
          <p className="mt-4 max-w-sm text-muted">{t("locationHome.subtitle")}</p>
          <Button href="/locations" className="mt-6 self-start">
            {t("locationHome.viewSchedule")}
          </Button>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-border-dark lg:min-h-[420px]">
          <iframe
            title={t("locationHome.mapTitle", { neighborhood: today.neighborhood })}
            src={mapSrc}
            className="absolute inset-0 h-full w-full border-0 grayscale-[15%] contrast-[1.05]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <aside className="absolute inset-x-4 bottom-4 z-10 rounded-xl border border-border-dark bg-surface-dark/95 p-5 backdrop-blur sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[min(100%,20rem)]">
            <p className="text-xs font-semibold tracking-[0.2em] text-yellow uppercase">
              {t("locationHome.todaysLocation")}
            </p>
            <h3 className="mt-2 font-display text-2xl tracking-wide uppercase">
              {today.neighborhood}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {today.address}
              <br />
              {today.city} {today.zip}
            </p>
            <p className="mt-2 text-sm text-white">{today.hours}</p>
            <a
              href={directionsUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border-b-2 border-yellow pb-0.5 text-sm font-semibold text-yellow hover:text-yellow-hover"
            >
              {t("common.getDirections")}
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

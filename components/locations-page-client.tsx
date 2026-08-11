"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { BusinessContactDetails } from "@/components/business-contact-details";
import { Button } from "@/components/button";
import { useContent } from "@/components/content-provider";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import { images } from "@/data/images";
import { getTodaysLocation, weeklyLocations } from "@/data/locations";
import { useT } from "@/lib/i18n";
import { formatBusinessAddress } from "@/lib/cms/utils";
import { directionsUrl, haversineMiles } from "@/lib/utils";

export function LocationsPageClient() {
  const t = useT();
  const { content } = useContent();
  const { business } = content;
  const address = formatBusinessAddress(business);
  const today = getTodaysLocation();
  const [distance, setDistance] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "unsupported"
  >("idle");

  function enableLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const miles = haversineMiles(
          position.coords.latitude,
          position.coords.longitude,
          today.lat,
          today.lng,
        );
        setDistance(miles);
        setGeoStatus("granted");
      },
      () => {
        setDistance(null);
        setGeoStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  function localizedNeighborhood(neighborhood: string) {
    if (neighborhood === "Jackson Heights") return t("locations.jacksonHeights");
    if (neighborhood === "Private Events") return t("locations.privateEvents");
    return neighborhood;
  }

  function localizedHours(hours: string) {
    if (hours === "By appointment") return t("locations.byAppointment");
    return hours;
  }

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-border-dark pt-4 pb-16 sm:pt-6 sm:pb-20">
        <Image
          src={images.heroFoodTruck}
          alt={t("locationsPage.altHero")}
          fill
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
        <div className="container-site relative">
          <BackButton className="mb-6" />
          <p className="text-sm font-semibold tracking-[0.22em] text-green uppercase">
            {t("locationsPage.eyebrow")}
          </p>
          <h1 className="mt-2 max-w-2xl font-brush text-fluid-section text-white">
            {t("locationsPage.title")}
          </h1>
          <p className="mt-4 max-w-xl text-muted">{t("locationsPage.subtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={enableLocation}
              loading={geoStatus === "loading"}
              leftIcon={<Navigation className="h-4 w-4" aria-hidden />}
            >
              {t("locationsPage.enableLocation")}
            </Button>
            <Button
              href={directionsUrl(address)}
              variant="outline-light"
              leftIcon={<MapPin className="h-4 w-4" aria-hidden />}
            >
              {t("locationsPage.directionsToday")}
            </Button>
          </div>
          {geoStatus === "granted" && distance !== null && (
            <p className="mt-4 text-sm text-yellow" role="status">
              {t("locationsPage.distance", {
                distance: distance.toFixed(1),
                neighborhood: localizedNeighborhood(today.neighborhood),
              })}
            </p>
          )}
          {geoStatus === "denied" && (
            <p className="mt-4 text-sm text-muted" role="status">
              {t("locationsPage.denied")}
            </p>
          )}
          {geoStatus === "unsupported" && (
            <p className="mt-4 text-sm text-muted" role="status">
              {t("locationsPage.unsupported")}
            </p>
          )}
        </div>
      </section>

      <section className="container-site grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-xl border border-border-dark">
          <div className="border-b border-border-dark bg-surface-dark px-4 py-3 text-sm font-semibold tracking-wide text-yellow uppercase">
            {t("locationsPage.weeklySchedule")}
          </div>
          <ul className="divide-y divide-border-dark bg-surface-dark-2">
            {weeklyLocations.map((stop) => (
              <li
                key={stop.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-xl tracking-wide uppercase">
                    {t(`days.${stop.day}`)}
                    {stop.isToday && (
                      <span className="ml-2 align-middle text-xs font-sans font-semibold tracking-wide text-yellow">
                        {t("common.today")}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-white">
                    {localizedNeighborhood(stop.neighborhood)}
                  </p>
                  {stop.isPrivate ? (
                    <p className="text-sm text-muted">
                      {t("locations.privateAddress")}
                    </p>
                  ) : (
                    <BusinessContactDetails
                      business={business}
                      className="mt-0"
                    />
                  )}
                  <p className="mt-1 text-sm text-muted">
                    {localizedHours(stop.hours)}
                  </p>
                </div>
                {!stop.isPrivate ? (
                  <a
                    href={directionsUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-yellow px-4 text-sm font-semibold text-yellow hover:bg-yellow hover:text-white"
                  >
                    {t("common.getDirections")}
                  </a>
                ) : (
                  <Button href="/catering" variant="outline-light">
                    {t("common.bookEvent")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-yellow/40 bg-surface-dark p-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-green uppercase">
              {t("locationsPage.todaysLocation")}
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-wide uppercase">
              {localizedNeighborhood(today.neighborhood)}
            </h2>
            <BusinessContactDetails business={business} className="mt-3" />
            <p className="mt-1 text-sm text-white">{localizedHours(today.hours)}</p>
            <Button
              href={directionsUrl(address)}
              className="mt-6 w-full sm:w-auto"
            >
              {t("common.getDirections")}
            </Button>
          </div>

          <GoogleMapEmbed
            query={address}
            title={t("locationsPage.mapTitle", {
              neighborhood: localizedNeighborhood(today.neighborhood),
            })}
            className="min-h-[280px] sm:min-h-[320px]"
          />
        </aside>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import { images } from "@/data/images";
import {
  fullAddress,
  getTodaysLocation,
  weeklyLocations,
} from "@/data/locations";
import { directionsUrl, haversineMiles } from "@/lib/utils";

export function LocationsPageClient() {
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

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-border-dark pt-4 pb-16 sm:pt-6 sm:pb-20">
        <Image
          src={images.heroFoodTruck}
          alt="Food truck parked outdoors"
          fill
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
        <div className="container-site relative">
          <BackButton className="mb-6" />
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            Locations
          </p>
          <h1 className="mt-2 max-w-2xl font-brush text-fluid-section text-white">
            FIND THE TRUCK
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            We roll different Jackson Heights stops almost every day. Here&apos;s
            this week&apos;s schedule — or enable location to see how far you are
            from today&apos;s pin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={enableLocation}
              loading={geoStatus === "loading"}
              leftIcon={<Navigation className="h-4 w-4" aria-hidden />}
            >
              Enable Location
            </Button>
            <Button
              href={directionsUrl(fullAddress(today))}
              variant="outline-light"
              leftIcon={<MapPin className="h-4 w-4" aria-hidden />}
            >
              Directions Today
            </Button>
          </div>
          {geoStatus === "granted" && distance !== null && (
            <p className="mt-4 text-sm text-yellow" role="status">
              You are about {distance.toFixed(1)} miles from today&apos;s stop
              in {today.neighborhood}.
            </p>
          )}
          {geoStatus === "denied" && (
            <p className="mt-4 text-sm text-muted" role="status">
              Location permission denied. You can still use Get Directions on
              any stop below.
            </p>
          )}
          {geoStatus === "unsupported" && (
            <p className="mt-4 text-sm text-muted" role="status">
              Geolocation isn&apos;t available in this browser.
            </p>
          )}
        </div>
      </section>

      <section className="container-site grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-xl border border-border-dark">
          <div className="border-b border-border-dark bg-surface-dark px-4 py-3 text-sm font-semibold tracking-wide text-yellow uppercase">
            Weekly Schedule
          </div>
          <ul className="divide-y divide-border-dark bg-surface-dark-2">
            {weeklyLocations.map((stop) => (
              <li
                key={stop.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-xl tracking-wide uppercase">
                    {stop.day}
                    {stop.isToday && (
                      <span className="ml-2 align-middle text-xs font-sans font-semibold tracking-wide text-yellow">
                        TODAY
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-white">{stop.neighborhood}</p>
                  <p className="text-sm text-muted">
                    {stop.address}
                    {!stop.isPrivate && ` · ${stop.city} ${stop.zip}`}
                  </p>
                  <p className="mt-1 text-sm text-muted">{stop.hours}</p>
                </div>
                {!stop.isPrivate ? (
                  <a
                    href={directionsUrl(fullAddress(stop))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-yellow px-4 text-sm font-semibold text-yellow hover:bg-yellow hover:text-background"
                  >
                    Get Directions
                  </a>
                ) : (
                  <Button href="/catering" variant="outline-light">
                    Book Event
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-yellow/40 bg-surface-dark p-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-yellow uppercase">
              Today&apos;s Location
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-wide uppercase">
              {today.neighborhood}
            </h2>
            <p className="mt-3 text-sm text-muted">{fullAddress(today)}</p>
            <p className="mt-1 text-sm text-white">{today.hours}</p>
            <Button
              href={directionsUrl(fullAddress(today))}
              className="mt-6 w-full sm:w-auto"
            >
              Get Directions
            </Button>
          </div>

          <GoogleMapEmbed
            lat={today.lat}
            lng={today.lng}
            query={fullAddress(today)}
            title={`Map of today's Street Flavor stop — ${today.neighborhood}`}
            className="min-h-[280px] sm:min-h-[320px]"
          />
        </aside>
      </section>
    </div>
  );
}

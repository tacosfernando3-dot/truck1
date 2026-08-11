"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { CateringInquiryForm } from "@/components/catering-inquiry-form";
import { images } from "@/data/images";
import { useT } from "@/lib/i18n";

const packages = [
  {
    id: "essentials",
    nameKey: "catering.pkgEssentials",
    priceKey: "catering.pkgEssentialsPrice",
    featureKeys: [
      "catering.pkgEssentials1",
      "catering.pkgEssentials2",
      "catering.pkgEssentials3",
      "catering.pkgEssentials4",
    ],
    highlighted: false,
  },
  {
    id: "crowd",
    nameKey: "catering.pkgCrowd",
    priceKey: "catering.pkgCrowdPrice",
    featureKeys: [
      "catering.pkgCrowd1",
      "catering.pkgCrowd2",
      "catering.pkgCrowd3",
      "catering.pkgCrowd4",
      "catering.pkgCrowd5",
    ],
    highlighted: true,
  },
  {
    id: "full-truck",
    nameKey: "catering.pkgFull",
    priceKey: "catering.pkgFullPrice",
    featureKeys: [
      "catering.pkgFull1",
      "catering.pkgFull2",
      "catering.pkgFull3",
      "catering.pkgFull4",
      "catering.pkgFull5",
    ],
    highlighted: false,
  },
] as const;

const eventTypeKeys = [
  "catering.eventType1",
  "catering.eventType2",
  "catering.eventType3",
  "catering.eventType4",
] as const;

const faqKeys = [
  { q: "catering.faq1q", a: "catering.faq1a" },
  { q: "catering.faq2q", a: "catering.faq2a" },
  { q: "catering.faq3q", a: "catering.faq3a" },
  { q: "catering.faq4q", a: "catering.faq4a" },
] as const;

export function CateringPageClient() {
  const t = useT();

  return (
    <div>
      <section className="relative isolate min-h-[420px] overflow-hidden">
        <Image
          src={images.cateringFood}
          alt={t("catering.altHero")}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/40" />
        <div className="container-site relative flex min-h-[420px] flex-col pb-14 pt-8 sm:pt-12">
          <BackButton className="mb-6 shrink-0" />
          <div className="mt-auto">
            <p className="text-sm font-semibold tracking-[0.22em] text-green uppercase">
              {t("catering.eyebrow")}
            </p>
            <h1 className="mt-2 max-w-3xl font-brush text-fluid-section text-white">
              {t("catering.title")}
            </h1>
            <p className="mt-4 max-w-xl text-muted">{t("catering.subtitle")}</p>
          </div>
        </div>
      </section>

      <section id="packages" className="container-site py-16">
        <h2 className="font-brush text-fluid-section text-white">
          {t("catering.packages")}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{t("catering.packagesIntro")}</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <article
              key={pkg.id}
              className={`rounded-xl border p-6 ${
                pkg.highlighted
                  ? "border-yellow bg-surface-dark"
                  : "border-border-dark bg-surface-dark-2"
              }`}
            >
              <h3 className="font-display text-2xl tracking-wide uppercase">
                {t(pkg.nameKey)}
              </h3>
              <p className="mt-2 text-sm font-semibold text-yellow">
                {t(pkg.priceKey)}
              </p>
              <ul className="mt-5 space-y-2">
                {pkg.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow" aria-hidden />
                    {t(featureKey)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border-dark bg-background-soft py-14">
        <div className="container-site">
          <h2 className="font-display text-3xl tracking-wide uppercase text-white">
            {t("catering.eventTypes")}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {eventTypeKeys.map((key) => (
              <li
                key={key}
                className="rounded-lg border border-border-dark bg-surface-dark px-4 py-3 text-sm text-muted"
              >
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-brush text-4xl text-white">{t("catering.formTitle")}</h2>
          <p className="mt-3 text-muted">{t("catering.formIntro")}</p>
        </div>
        <div className="rounded-xl border border-border-dark bg-surface-dark p-6 sm:p-8">
          <CateringInquiryForm />
        </div>
      </section>

      <section id="faq" className="border-t border-border-dark bg-cream py-16 text-background">
        <div className="container-site">
          <h2 className="font-brush text-fluid-section">{t("catering.faqs")}</h2>
          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            {faqKeys.map((item) => (
              <div key={item.q} className="rounded-xl border border-border-light bg-white p-5">
                <dt className="font-display text-xl tracking-wide uppercase">
                  {t(item.q)}
                </dt>
                <dd className="mt-2 text-sm text-background/70">{t(item.a)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

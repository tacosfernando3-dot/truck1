"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { CateringInquiryForm } from "@/components/catering-inquiry-form";
import { SectionHeading } from "@/components/section-heading";
import { images } from "@/data/images";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const faqKeys = [
  { q: "catering.faq1q", a: "catering.faq1a" },
  { q: "catering.faq2q", a: "catering.faq2a" },
  { q: "catering.faq3q", a: "catering.faq3a" },
  { q: "catering.faq4q", a: "catering.faq4a" },
  { q: "catering.faq5q", a: "catering.faq5a" },
  { q: "catering.faq6q", a: "catering.faq6a" },
  { q: "catering.faq7q", a: "catering.faq7a" },
] as const;

function CateringFaqList() {
  const t = useT();
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mt-10 border-t border-background/12">
      {faqKeys.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.q} className="border-b border-background/12">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full items-start justify-between gap-4 py-5 text-left transition hover:text-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              >
                <span className="flex min-w-0 items-start gap-4">
                  <span className="mt-0.5 font-display text-lg tracking-wide text-red/70 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[1.35rem] leading-tight tracking-wide uppercase sm:text-2xl">
                    {t(item.q)}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "mt-1 h-5 w-5 shrink-0 text-background/45 transition duration-300",
                    open && "rotate-180 text-red",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className={cn(open ? "block" : "hidden")}
            >
              <p className="max-w-3xl pb-6 pl-12 text-base leading-relaxed text-background/70 sm:pl-14 sm:text-[1.05rem]">
                {t(item.a)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
            <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
              {t("catering.eyebrow")}
            </p>
            <h1 className="mt-2 max-w-3xl font-brush text-fluid-section text-white">
              {t("catering.title")}
            </h1>
            <p className="mt-4 max-w-xl text-muted">{t("catering.subtitle")}</p>
          </div>
        </div>
      </section>

      <section id="inquiry" className="container-site py-16">
        <div className="max-w-2xl">
          <h2 className="font-brush text-4xl text-white">{t("catering.formTitle")}</h2>
          <p className="mt-3 text-muted">{t("catering.formIntro")}</p>
        </div>
        <div className="mt-8 rounded-xl border border-border-dark bg-surface-dark p-5 sm:p-6 lg:p-8">
          <CateringInquiryForm />
        </div>
      </section>

      <section
        id="faq"
        className="border-t border-border-dark bg-cream py-16 text-background sm:py-20"
      >
        <div className="container-site">
          <SectionHeading
            eyebrow={t("catering.faqsEyebrow")}
            title={t("catering.faqs")}
            description={t("catering.faqsIntro")}
          />

          <CateringFaqList />

          <div className="mt-12 flex flex-col gap-4 border-t border-background/12 pt-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-2xl tracking-wide uppercase">
                {t("catering.faqsCta")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-background/65 sm:text-base">
                {t("catering.faqsCtaBody")}
              </p>
            </div>
            <Button href="#inquiry" className="shrink-0 self-start sm:self-auto">
              {t("catering.faqsCtaLink")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { CateringInquiryForm } from "@/components/catering-inquiry-form";
import { images } from "@/data/images";
import type { CateringPackage } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Bring Street Flavor to your event — packages from $18 per guest with on-site truck options.",
};

const packages: CateringPackage[] = [
  {
    id: "essentials",
    name: "Street Essentials",
    priceLabel: "Starting at $18 per guest",
    features: [
      "Two entrées",
      "Two sides",
      "Sauces and toppings",
      "Disposable serviceware",
    ],
  },
  {
    id: "crowd",
    name: "Crowd Favorite",
    priceLabel: "Starting at $25 per guest",
    features: [
      "Three entrées",
      "Three sides",
      "Drinks",
      "Full condiment station",
      "Service staff",
    ],
    highlighted: true,
  },
  {
    id: "full-truck",
    name: "Full Truck Experience",
    priceLabel: "Starting at $35 per guest",
    features: [
      "On-site food truck",
      "Custom menu",
      "Unlimited service window",
      "Staff",
      "Setup and cleanup",
    ],
  },
];

const eventTypes = [
  "Corporate lunches & offsites",
  "Weddings and private parties",
  "Festivals and night markets",
  "Film / production craft services",
];

const faqs = [
  {
    q: "How far in advance should we book?",
    a: "Two to four weeks is ideal for standard packages. Full truck bookings fill faster on weekends.",
  },
  {
    q: "Do you travel outside Jackson Heights?",
    a: "Yes — we cover Queens and Greater NYC. Travel fees may apply outside the borough.",
  },
  {
    q: "Can you accommodate dietary needs?",
    a: "We regularly prep vegetarian bowls and can discuss gluten-conscious options when you inquire.",
  },
  {
    q: "Is a deposit required?",
    a: "A deposit holds your date once we confirm availability. Details come with your quote.",
  },
];

export default function CateringPage() {
  return (
    <div>
      <section className="relative isolate min-h-[420px] overflow-hidden">
        <Image
          src={images.cateringFood}
          alt="Catering food trays with grilled meats and vegetables"
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
              Catering
            </p>
            <h1 className="mt-2 max-w-3xl font-brush text-fluid-section text-white">
              BRING THE FLAVOR TO YOUR EVENT
            </h1>
            <p className="mt-4 max-w-xl text-muted">
              From rooftop birthdays to production craft services, Street Flavor
              rolls up with a tight crew, a customizable menu, and lines that
              actually move.
            </p>
          </div>
        </div>
      </section>

      <section id="packages" className="container-site py-16">
        <h2 className="font-brush text-fluid-section text-white">Packages</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Minimums typically start at 40 guests. Pricing scales with headcount,
          menu complexity, and travel.
        </p>
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
                {pkg.name}
              </h3>
              <p className="mt-2 text-sm font-semibold text-yellow">
                {pkg.priceLabel}
              </p>
              <ul className="mt-5 space-y-2">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow" aria-hidden />
                    {feature}
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
            Event Types
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {eventTypes.map((type) => (
              <li
                key={type}
                className="rounded-lg border border-border-dark bg-surface-dark px-4 py-3 text-sm text-muted"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-brush text-4xl text-white">Tell us about your event</h2>
          <p className="mt-3 text-muted">
            Share the date, headcount, and vibe. We&apos;ll follow up with
            availability — no backend required for this demo form.
          </p>
        </div>
        <div className="rounded-xl border border-border-dark bg-surface-dark p-6 sm:p-8">
          <CateringInquiryForm />
        </div>
      </section>

      <section id="faq" className="border-t border-border-dark bg-cream py-16 text-background">
        <div className="container-site">
          <h2 className="font-brush text-fluid-section">FAQs</h2>
          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-xl border border-border-light bg-white p-5">
                <dt className="font-display text-xl tracking-wide uppercase">
                  {item.q}
                </dt>
                <dd className="mt-2 text-sm text-background/70">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

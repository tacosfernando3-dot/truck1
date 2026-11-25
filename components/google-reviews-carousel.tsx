"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";
import {
  CACHED_GOOGLE_REVIEWS,
  type GoogleReview,
  type GoogleReviewsPayload,
} from "@/lib/google-reviews-data";
import { cn } from "@/lib/utils";

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-gold",
        size === "sm" ? "gap-px" : "gap-0.5",
      )}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
            i < full ? "fill-gold text-gold" : "fill-transparent text-gold/35",
          )}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}

function reviewBody(review: GoogleReview, locale: string) {
  if (locale === "es" && review.textEs?.trim()) return review.textEs.trim();
  return review.text.trim();
}

function ReviewCard({
  review,
  locale,
}: {
  review: GoogleReview;
  locale: string;
}) {
  const body = reviewBody(review, locale);
  return (
    <article className="flex h-full flex-col rounded-xl border border-border-dark bg-surface-dark/90 p-5 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{review.author}</p>
          {review.relativeTime ? (
            <p className="mt-0.5 text-xs text-muted">{review.relativeTime}</p>
          ) : null}
        </div>
        <Stars rating={review.rating} size="sm" />
      </div>
      {body ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/90">
          “{body}”
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm text-muted">—</p>
      )}
      <p className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Google
      </p>
    </article>
  );
}

function CtaCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col justify-between rounded-xl border border-dashed border-gold/40 bg-surface-dark-2/80 p-5 transition hover:border-gold hover:bg-surface-dark"
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
          Google
        </p>
        <p className="mt-3 font-display text-2xl tracking-wide text-white uppercase">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
      <span className="mt-6 inline-block self-start border-b-2 border-yellow pb-0.5 text-sm font-semibold text-yellow">
        →
      </span>
    </a>
  );
}

export function GoogleReviewsCarousel() {
  const t = useT();
  const { locale } = useI18n();
  const [payload, setPayload] = useState<GoogleReviewsPayload>(
    CACHED_GOOGLE_REVIEWS,
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/google-reviews?t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as GoogleReviewsPayload;
        if (cancelled || !data?.reviews) return;
        setPayload(data);
      } catch {
        /* keep last known payload */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    const reviews = payload.reviews ?? [];
    type Slot =
      | { kind: "review"; review: GoogleReview; key: string }
      | { kind: "cta"; key: string };
    const slots: Slot[] = reviews.map((review) => ({
      kind: "review",
      review,
      key: review.id,
    }));
    slots.push({ kind: "cta", key: "write-review" });

    // Pad short lists so the marquee feels full, then double for a seamless -50% loop.
    const base: Slot[] = [...slots];
    let pad = 0;
    while (base.length < 4) {
      for (const slot of slots) {
        base.push({
          ...slot,
          key: `${slot.key}-pad-${pad}`,
        });
        if (base.length >= 4) break;
      }
      pad += 1;
    }

    const loop = [...base, ...base].map((slot, index) => ({
      ...slot,
      loopKey: `${slot.key}-${index}`,
    }));
    return { base, loop };
  }, [payload.reviews]);

  const durationSec = Math.max(28, cards.base.length * 9);

  return (
    <div className="mt-10 sm:mt-12">
      <div className="container-site flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-gold uppercase">
            {t("googleReviews.eyebrow")}
          </p>
          <h3 className="mt-2 font-brush text-fluid-section text-white">
            {t("googleReviews.title")}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Stars rating={payload.rating} />
            <p className="text-sm text-muted">
              <span className="font-semibold text-white">
                {payload.rating.toFixed(1)}
              </span>
              {" · "}
              {t("googleReviews.basedOn", {
                count: payload.userRatingCount,
              })}
            </p>
          </div>
        </div>
        <a
          href={payload.shareUrl || payload.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start border-b-2 border-yellow pb-0.5 text-sm font-semibold text-yellow hover:text-yellow-hover sm:self-auto"
        >
          {t("googleReviews.seeAll")}
        </a>
      </div>

      <div
        className="reviews-marquee mt-6 sm:mt-8"
        aria-label={t("googleReviews.title")}
      >
        <div
          className="reviews-marquee-track"
          style={{ animationDuration: `${durationSec}s` }}
        >
          {cards.loop.map((slot, index) => {
            const isClone = index >= cards.base.length;
            return (
              <div
                key={slot.loopKey}
                className="reviews-marquee-item"
                aria-hidden={isClone ? true : undefined}
                inert={isClone ? true : undefined}
              >
                {slot.kind === "review" ? (
                  <ReviewCard review={slot.review} locale={locale} />
                ) : (
                  <CtaCard
                    href={payload.writeReviewUrl}
                    title={t("googleReviews.writeTitle")}
                    subtitle={t("googleReviews.writeSubtitle")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

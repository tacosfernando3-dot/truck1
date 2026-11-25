/** Shared Google review types + seed data (safe for client components). */

export const GOOGLE_PLACE_ID = "ChIJlyyZKyxfwokR7Lo-hxcGQmw";
export const GOOGLE_KGMID = "/g/11_1qj1bj2";
export const GOOGLE_SHARE_URL = "https://share.google/vypiruHEl1LUxRIMK";
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/?q=place_id:ChIJlyyZKyxfwokR7Lo-hxcGQmw";
export const GOOGLE_WRITE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJlyyZKyxfwokR7Lo-hxcGQmw";

export type GoogleReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  textEs?: string;
  relativeTime?: string;
  publishedAt?: string;
  profilePhotoUrl?: string;
  authorUrl?: string;
};

export type GoogleReviewsPayload = {
  placeId: string;
  name: string;
  rating: number;
  userRatingCount: number;
  mapsUrl: string;
  shareUrl: string;
  writeReviewUrl: string;
  reviews: GoogleReview[];
  source: "places" | "maps" | "cms" | "cache";
  updatedAt: string;
};

/** Format a publishedAt ISO timestamp into a live relative string. */
export function formatReviewRelativeTime(
  publishedAt: string | undefined,
  fallback?: string,
  nowMs: number = Date.now(),
): string | undefined {
  if (!publishedAt) return fallback;
  const then = Date.parse(publishedAt);
  if (!Number.isFinite(then)) return fallback;

  const diffSec = Math.max(0, Math.round((nowMs - then) / 1000));
  if (diffSec < 60) return "just now";
  const mins = Math.round(diffSec / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 18) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function withFreshRelativeTimes(
  reviews: GoogleReview[],
  nowMs: number = Date.now(),
): GoogleReview[] {
  return reviews.map((review) => ({
    ...review,
    relativeTime: formatReviewRelativeTime(
      review.publishedAt,
      review.relativeTime,
      nowMs,
    ),
  }));
}

/** Seeded fallback when Places + CMS are unavailable. */
export const CACHED_GOOGLE_REVIEWS: GoogleReviewsPayload = {
  placeId: GOOGLE_PLACE_ID,
  name: "Los Compadres Taqueria",
  rating: 5,
  userRatingCount: 3,
  mapsUrl: GOOGLE_MAPS_URL,
  shareUrl: GOOGLE_SHARE_URL,
  writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
  source: "cache",
  updatedAt: "2026-11-25T14:00:00.000Z",
  reviews: [
    {
      id: "fernando-santiago-2026-11-23",
      author: "Fernando Santiago",
      rating: 5,
      text: "A beauty",
      textEs: "Una belleza",
      publishedAt: "2026-11-23T20:30:00.000Z",
    },
  ],
};

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
  source: "places" | "cms" | "cache";
  updatedAt: string;
};

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

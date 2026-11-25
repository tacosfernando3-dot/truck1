import "server-only";

import { readCms, writeCms } from "@/lib/cms/store";
import {
  CACHED_GOOGLE_REVIEWS,
  GOOGLE_KGMID,
  GOOGLE_MAPS_URL,
  GOOGLE_PLACE_ID,
  GOOGLE_SHARE_URL,
  GOOGLE_WRITE_REVIEW_URL,
  withFreshRelativeTimes,
  type GoogleReview,
  type GoogleReviewsPayload,
} from "@/lib/google-reviews-data";

export * from "@/lib/google-reviews-data";

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type PlacesDetails = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
};

export function placeIdFromEnv() {
  return (
    process.env.GOOGLE_PLACE_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID?.trim() ||
    GOOGLE_PLACE_ID
  );
}

export function apiKeyFromEnv() {
  return (
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

function mapPlacesReview(review: PlacesReview, index: number): GoogleReview | null {
  const author = review.authorAttribution?.displayName?.trim();
  const text = review.text?.text?.trim() || "";
  const rating = Number(review.rating ?? 0);
  if (!author || rating < 1) return null;

  return {
    id: review.name || `places-${index}-${author}`,
    author,
    rating,
    text,
    relativeTime: review.relativePublishTimeDescription,
    publishedAt: review.publishTime,
    profilePhotoUrl: review.authorAttribution?.photoUri,
    authorUrl: review.authorAttribution?.uri,
  };
}

function finalizePayload(payload: GoogleReviewsPayload): GoogleReviewsPayload {
  return {
    ...payload,
    reviews: withFreshRelativeTimes(payload.reviews),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchGoogleReviewsFromPlaces(): Promise<GoogleReviewsPayload | null> {
  const apiKey = apiKeyFromEnv();
  if (!apiKey) return null;

  const placeId = placeIdFromEnv();
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,displayName,rating,userRatingCount,reviews",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("[google-reviews] Places API", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as PlacesDetails;
  const reviews = (data.reviews ?? [])
    .map(mapPlacesReview)
    .filter((r): r is GoogleReview => Boolean(r));

  return {
    placeId: data.id || placeId,
    name: data.displayName?.text || CACHED_GOOGLE_REVIEWS.name,
    rating: data.rating ?? CACHED_GOOGLE_REVIEWS.rating,
    userRatingCount:
      data.userRatingCount ?? CACHED_GOOGLE_REVIEWS.userRatingCount,
    mapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    shareUrl: GOOGLE_SHARE_URL,
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
    reviews,
    source: "places",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Public Maps preview endpoint — returns live rating + review count without
 * a Places API key. Review bodies are not included (Google gates those).
 */
export async function fetchGoogleReviewsMetaFromMaps(): Promise<{
  rating: number;
  userRatingCount: number;
} | null> {
  const placeId = placeIdFromEnv();
  const cid = "0x89c25f2c2b992c97:0x6c420617873ebaec";
  const pb = [
    "!1m16",
    `!1s${encodeURIComponent(cid)}`,
    "!3m8!1m3!1d3022!2d-73.8824!3d40.7425!3m2!1i1024!2i768!4f13.1",
    "!4m2!3d40.7425!4d-73.8824",
    `!15m2!1m1!4s${encodeURIComponent(GOOGLE_KGMID)}`,
    "!6m7!1e1!4e1!5e1!6e1!7e1!12e1!13e0",
  ].join("");

  try {
    const res = await fetch(
      `https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=us&pb=${pb}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const text = await res.text();
    // Pattern seen in preview payloads: "3 reviews",...,5,3]
    const labeled = text.match(
      /"(\d+)\s+reviews?"\s*,\s*(?:null,)*\s*(\d+(?:\.\d+)?)\s*,\s*(\d+)\s*]/i,
    );
    if (labeled) {
      const userRatingCount = Number(labeled[1] || labeled[3]);
      const rating = Number(labeled[2]);
      if (userRatingCount > 0 && rating > 0) {
        return { rating, userRatingCount };
      }
    }
    const compact = text.match(/null,null,null,(\d+(?:\.\d+)?),(\d+)\]/);
    if (compact) {
      const rating = Number(compact[1]);
      const userRatingCount = Number(compact[2]);
      if (userRatingCount > 0 && rating > 0) {
        return { rating, userRatingCount };
      }
    }
    // Fallback: place_id confirmation + known listing
    if (text.includes(placeId) || text.includes("Los Compadres")) {
      const countMatch = text.match(/"(\d+)\s+reviews?"/i);
      if (countMatch) {
        return {
          rating: CACHED_GOOGLE_REVIEWS.rating,
          userRatingCount: Number(countMatch[1]),
        };
      }
    }
  } catch (error) {
    console.error("[google-reviews] Maps meta", error);
  }
  return null;
}

async function fetchGoogleReviewsFromCms(): Promise<GoogleReviewsPayload | null> {
  try {
    const cms = await readCms();
    const snap = cms.business.googleReviews;
    if (!snap?.reviews?.length) return null;

    return {
      placeId: placeIdFromEnv(),
      name: cms.business.name || CACHED_GOOGLE_REVIEWS.name,
      rating: snap.rating,
      userRatingCount: Math.max(snap.userRatingCount, snap.reviews.length),
      mapsUrl: GOOGLE_MAPS_URL,
      shareUrl: GOOGLE_SHARE_URL,
      writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
      reviews: snap.reviews,
      source: "cms",
      updatedAt: snap.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("[google-reviews] CMS", error);
    return null;
  }
}

async function persistPlacesReviewsToCms(live: GoogleReviewsPayload) {
  if (!live.reviews.length) return;
  try {
    const content = await readCms();
    content.business.googleReviews = {
      rating: live.rating,
      userRatingCount: live.userRatingCount,
      reviews: live.reviews,
      updatedAt: live.updatedAt,
    };
    await writeCms(content);
  } catch (error) {
    console.error("[google-reviews] persist CMS", error);
  }
}

export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  try {
    const live = await fetchGoogleReviewsFromPlaces();
    if (live) {
      if (live.reviews.length > 0) {
        // Keep CMS in sync so the site stays fresh even if Places is later unset.
        void persistPlacesReviewsToCms(live);
        return finalizePayload(live);
      }
      const cms = await fetchGoogleReviewsFromCms();
      if (cms?.reviews.length) {
        return finalizePayload({
          ...live,
          reviews: cms.reviews,
          source: "places",
        });
      }
      return finalizePayload({
        ...live,
        reviews: CACHED_GOOGLE_REVIEWS.reviews,
      });
    }
  } catch (error) {
    console.error("[google-reviews]", error);
  }

  const [cms, meta] = await Promise.all([
    fetchGoogleReviewsFromCms(),
    fetchGoogleReviewsMetaFromMaps(),
  ]);

  const base = cms ?? CACHED_GOOGLE_REVIEWS;
  if (meta) {
    return finalizePayload({
      ...base,
      rating: meta.rating,
      userRatingCount: Math.max(meta.userRatingCount, base.reviews.length),
      source: "maps",
      updatedAt: new Date().toISOString(),
    });
  }

  return finalizePayload(base);
}

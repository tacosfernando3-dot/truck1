import "server-only";

import { readCms } from "@/lib/cms/store";
import {
  CACHED_GOOGLE_REVIEWS,
  GOOGLE_MAPS_URL,
  GOOGLE_PLACE_ID,
  GOOGLE_SHARE_URL,
  GOOGLE_WRITE_REVIEW_URL,
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

export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  try {
    const live = await fetchGoogleReviewsFromPlaces();
    if (live) {
      if (live.reviews.length > 0) return live;
      const cms = await fetchGoogleReviewsFromCms();
      if (cms?.reviews.length) {
        return {
          ...live,
          reviews: cms.reviews,
          source: "places",
        };
      }
      return {
        ...live,
        reviews: CACHED_GOOGLE_REVIEWS.reviews,
      };
    }
  } catch (error) {
    console.error("[google-reviews]", error);
  }

  const cms = await fetchGoogleReviewsFromCms();
  if (cms) return cms;

  return CACHED_GOOGLE_REVIEWS;
}

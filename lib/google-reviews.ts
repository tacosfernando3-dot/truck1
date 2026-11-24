/** Google Business Profile for Los Compadres Taquería (Elmhurst). */
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
  source: "places" | "cache";
  updatedAt: string;
};

/** Seeded from the live Google listing (kgmid /g/11_1qj1bj2). */
export const CACHED_GOOGLE_REVIEWS: GoogleReviewsPayload = {
  placeId: GOOGLE_PLACE_ID,
  name: "Los Compadres Taqueria",
  rating: 5,
  userRatingCount: 1,
  mapsUrl: GOOGLE_MAPS_URL,
  shareUrl: GOOGLE_SHARE_URL,
  writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
  source: "cache",
  updatedAt: "2026-11-23T22:40:00.000Z",
  reviews: [
    {
      id: "fernando-santiago-2026-11-23",
      author: "Fernando Santiago",
      rating: 5,
      text: "A beauty",
      textEs: "Una belleza",
      publishedAt: "2026-11-23T20:30:00.000Z",
      relativeTime: "2 hours ago",
    },
  ],
};

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

function placeIdFromEnv() {
  return (
    process.env.GOOGLE_PLACE_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID?.trim() ||
    GOOGLE_PLACE_ID
  );
}

function apiKeyFromEnv() {
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

export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  try {
    const live = await fetchGoogleReviewsFromPlaces();
    if (live && (live.reviews.length > 0 || live.userRatingCount > 0)) {
      // Prefer live reviews; if Places returned rating but empty review list,
      // keep seed texts so the carousel still has content.
      if (live.reviews.length === 0) {
        return {
          ...live,
          reviews: CACHED_GOOGLE_REVIEWS.reviews,
        };
      }
      return live;
    }
  } catch (error) {
    console.error("[google-reviews]", error);
  }

  return CACHED_GOOGLE_REVIEWS;
}

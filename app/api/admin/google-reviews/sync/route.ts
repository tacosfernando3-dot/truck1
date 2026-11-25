import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { readCms, writeCms } from "@/lib/cms/store";
import {
  apiKeyFromEnv,
  fetchGoogleReviewsFromPlaces,
} from "@/lib/google-reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!apiKeyFromEnv()) {
    return NextResponse.json(
      {
        error:
          "Missing GOOGLE_PLACES_API_KEY. Add it in Vercel env vars, then sync again.",
      },
      { status: 400 },
    );
  }

  try {
    const live = await fetchGoogleReviewsFromPlaces();
    if (!live) {
      return NextResponse.json(
        { error: "Places API returned no data" },
        { status: 502 },
      );
    }

    const content = await readCms();
    content.business.googleReviews = {
      rating: live.rating,
      userRatingCount: live.userRatingCount,
      reviews: live.reviews.length
        ? live.reviews
        : content.business.googleReviews.reviews,
      updatedAt: live.updatedAt,
    };
    const saved = await writeCms(content);

    return NextResponse.json({
      ok: true,
      source: live.source,
      googleReviews: saved.business.googleReviews,
      reviewCount: saved.business.googleReviews.reviews.length,
    });
  } catch (error) {
    console.error("[admin/google-reviews/sync]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}

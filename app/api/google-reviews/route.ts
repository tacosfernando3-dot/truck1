import { NextResponse } from "next/server";
import { getGoogleReviews } from "@/lib/google-reviews";

export const revalidate = 3600;

export async function GET() {
  try {
    const payload = await getGoogleReviews();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[api/google-reviews]", error);
    return NextResponse.json(
      { error: "Failed to load Google reviews" },
      { status: 500 },
    );
  }
}

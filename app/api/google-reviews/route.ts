import { NextResponse } from "next/server";
import { getGoogleReviews } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getGoogleReviews();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
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

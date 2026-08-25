import { NextResponse } from "next/server";
import { readCms } from "@/lib/cms/store";
import {
  getInstagramFeed,
  instagramUsernameFromBusinessUrl,
} from "@/lib/instagram/feed";

export const revalidate = 1800;

export async function GET() {
  try {
    const cms = await readCms();
    const username = instagramUsernameFromBusinessUrl(cms.business.instagram);
    const items = await getInstagramFeed(5, username);

    return NextResponse.json(
      {
        source: items.length ? "instagram" : "empty",
        username,
        items,
        configured: Boolean(
          process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || username,
        ),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("[instagram/feed]", error);
    return NextResponse.json(
      { source: "error", items: [], configured: false },
      { status: 500 },
    );
  }
}

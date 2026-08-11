import { NextResponse } from "next/server";
import { readCms } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await readCms();
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

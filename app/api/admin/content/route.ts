import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { readCms, writeCms } from "@/lib/cms/store";
import type { CmsContent } from "@/lib/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isCmsContent(value: unknown): value is CmsContent {
  if (!value || typeof value !== "object") return false;
  const v = value as CmsContent;
  return (
    Array.isArray(v.menu) &&
    Array.isArray(v.gallery) &&
    !!v.business &&
    (v.categories === undefined || Array.isArray(v.categories))
  );
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await readCms());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (!isCmsContent(body)) {
    return NextResponse.json({ error: "Invalid content payload" }, { status: 400 });
  }

  try {
    const content = await writeCms(body);
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

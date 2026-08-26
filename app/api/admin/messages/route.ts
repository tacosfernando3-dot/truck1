import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cms/auth";
import { listSiteMessages, updateMessageStatus } from "@/lib/messages/store";
import type { MessageStatus } from "@/lib/messages/types";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: MessageStatus[] = ["new", "read", "archived"];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured", messages: [] },
      { status: 503 },
    );
  }

  try {
    const messages = await listSiteMessages(300);
    return NextResponse.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: MessageStatus;
  } | null;

  if (!body?.id || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
  }

  try {
    const message = await updateMessageStatus(body.id, body.status);
    return NextResponse.json({ message });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
